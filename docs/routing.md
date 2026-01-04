# Routing

This document describes the file-based routing system used in this project.

## File Structure

Routes are defined as `.tsx` files in the `src/routes/` directory. The file path determines the URL path.

## Route Mapping

| File Path | URL Path |
|-----------|----------|
| `src/routes/index.tsx` | `/` |
| `src/routes/about.tsx` | `/about` |
| `src/routes/blog/index.tsx` | `/blog` |
| `src/routes/blog/post.tsx` | `/blog/post` |

## Dynamic Routes

Use `$param` prefix for dynamic route segments. These become `:param` in the URL pattern.

| File Path | URL Path | Example Match |
|-----------|----------|---------------|
| `src/routes/users/$id.tsx` | `/users/:id` | `/users/123` |
| `src/routes/blog/$slug.tsx` | `/blog/:slug` | `/blog/my-post` |

Access params via the request context:

```tsx
import { getParams } from "@/lib/context";

export default function UserPage() {
  const params = getParams();
  return <div>User ID: {params.id}</div>;
}
```

## Special Files

| File | Purpose |
|------|---------|
| `__Root.tsx` | Root HTML wrapper (html, head, body tags) |
| `_layout.tsx` | Layout wrapper for directory and subdirectories |

Files starting with `__` are excluded from route generation.

## Layouts

Create a `_layout.tsx` file in any directory to wrap all routes in that directory and its subdirectories.

```
src/routes/
  _layout.tsx          # Applies to all routes
  index.tsx
  cms/
    _layout.tsx        # Applies to /cms/* routes (nested inside root layout)
    index.tsx
    posts.tsx
```

Layouts are applied from outermost (root) to innermost (deepest directory).

### Layout Types

**React Component Layout:**

```tsx
import { Outlet } from "@/components/outlet";

export default function Layout() {
  return (
    <div className="container">
      <Outlet />
    </div>
  );
}
```

**Handler Layout (for auth guards, redirects):**

```tsx
import { Outlet } from "@/components/outlet";
import { getSession } from "@/lib/context";

export default function Layout(req: Request) {
  const session = getSession();

  if (!session.isAuthenticated) {
    return Response.redirect("/identity/sign-in");
  }

  return (
    <div className="authenticated-layout">
      <Outlet />
    </div>
  );
}
```

## HTTP Methods

Export named functions for specific HTTP methods:

```tsx
// GET request (or use default export for full page)
export function GET(req: Request) {
  return <PartialComponent />;
}

// POST request
export async function POST(req: Request) {
  const formData = await req.formData();
  // Handle form submission
  return <FormResult />;
}

// PUT request
export async function PUT(req: Request) {
  // Handle update
  return new Response("Updated", { status: 200 });
}

// DELETE request
export async function DELETE(req: Request) {
  // Handle deletion
  return new Response("Deleted", { status: 200 });
}
```

### Default Export vs GET Export

- `default` export: Used for full page GET requests
- `GET` export: Used for partial/HTMX GET requests

```tsx
// Full page render
export default function Page() {
  return <FullPage />;
}

// Partial render (HTMX requests)
export function GET(req: Request) {
  return <PartialContent />;
}
```

## Partial Requests & Root Wrapping

All HTTP methods that return a React component are wrapped with `__Root` (the HTML shell) for full page requests. Partial requests skip the Root wrapper.

### What Triggers a Partial Request?

1. `HX-Request: true` header is present (HTMX)
2. `?partial=yes` query parameter is set

### Behavior by HTTP Method

| Method | Full Page Request | Partial Request (`HX-Request` or `?partial=yes`) |
|--------|-------------------|--------------------------------------------------|
| `default` | Wrapped with Root | Routes to `GET` export if exists, otherwise no Root |
| `GET` | Wrapped with Root | No Root wrapper |
| `POST` | Wrapped with Root | No Root wrapper |
| `PUT` | Wrapped with Root | No Root wrapper |
| `DELETE` | Wrapped with Root | No Root wrapper |

### Key Behaviors

**GET Requests:**
- Full page GET → uses `default` export, wrapped with Root
- Partial GET (`HX-Request` or `?partial=yes`) → uses `GET` export if defined, no Root
- If no `GET` export exists, partial requests fall back to `default` export (without Root)

**POST/PUT/DELETE Requests:**
- Full page request returning a component → wrapped with Root
- Partial request (`HX-Request` or `?partial=yes`) → no Root wrapper
- Returning a `Response` object (e.g., redirect) → returned directly, no rendering

### Examples

**Form submission with full page re-render:**

```tsx
// If user submits form via regular browser POST (no JS),
// they get a full page with Root wrapper
export async function POST(req: Request) {
  const formData = await req.formData();
  // ... process form
  return <ResultPage />;  // Wrapped with Root for full page
}
```

**Form submission with HTMX:**

```tsx
// HTMX adds HX-Request header, so response is partial
export async function POST(req: Request) {
  const formData = await req.formData();
  // ... process form
  return <PartialResult />;  // No Root wrapper, just the component
}
```

**Redirect after form submission (most common pattern):**

```tsx
export async function POST(req: Request) {
  const formData = await req.formData();
  // ... process form
  return new Response(null, {
    status: 302,
    headers: { Location: "/success" },
  });
}
```

**Explicit partial request via query param:**

```
POST /api/items?partial=yes
```

This returns the component without Root wrapper, useful for programmatic fetches that don't use HTMX.

## Return Types

Route handlers can return:

- **React Element**: Rendered to HTML
- **Response**: Returned directly (for redirects, JSON, etc.)

```tsx
// Return React element
export function GET() {
  return <MyComponent />;
}

// Return Response
export function POST(req: Request) {
  return Response.redirect("/success");
}

// Return Response with headers
export function POST(req: Request) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
      "Set-Cookie": "session=abc123",
    },
  });
}
```

## Route Generation

Routes are auto-generated by running:

```bash
bun scripts/cli.ts dev   # Development (watches for changes)
bun scripts/cli.ts build # Production build
```

Generated routes are written to `src/routes.generated.tsx`.
