import { renderToReadableStream } from "react-dom/server";
import { Glob } from "bun";
import Root from "./routes/__Root";

// Route module type
type RouteModule = {
  default: React.ComponentType;
};

// Convert file path to URL path
// - src/routes/index.tsx -> /
// - src/routes/users/index.tsx -> /users
// - src/routes/users/create.tsx -> /users/create
// - src/routes/users/payments.plan.create.tsx -> /users/payments/plan/create
function filePathToRoutePath(filePath: string): string {
  // Remove src/routes prefix and .tsx extension
  let route = filePath
    .replace(/^src\/routes\//, "")
    .replace(/\.tsx$/, "");

  // Handle index files
  if (route === "index") {
    return "/";
  }
  if (route.endsWith("/index")) {
    route = route.replace(/\/index$/, "");
  }

  // Convert dots to slashes for nested routes (e.g., payments.plan.create -> payments/plan/create)
  route = route.replace(/\./g, "/");

  return "/" + route;
}

// Create SSR handler for a route component
function createSSRHandler(Component: React.ComponentType) {
  return async (_req: Request): Promise<Response> => {
    const stream = await renderToReadableStream(
      <Root>
        <Component />
      </Root>
    );
    return new Response(stream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  };
}

// Scan routes directory and build route map
async function buildRoutes(): Promise<Record<string, (req: Request) => Promise<Response>>> {
  const routes: Record<string, (req: Request) => Promise<Response>> = {};
  const glob = new Glob("**/*.tsx");
  const routesDir = import.meta.dir + "/routes";

  for await (const file of glob.scan(routesDir)) {
    // Skip __Root.tsx and any files starting with __
    if (file.startsWith("__")) continue;

    const fullPath = `${routesDir}/${file}`;
    const routePath = filePathToRoutePath(`src/routes/${file}`);

    try {
      const module = (await import(fullPath)) as RouteModule;
      if (module.default) {
        routes[routePath] = createSSRHandler(module.default);
      }
    } catch (error) {
      console.error(`Failed to load route ${file}:`, error);
    }
  }

  return routes;
}

// Export the routes
export const routes = await buildRoutes();

// Export a handler that can be used with Bun.serve
export async function handleUIRoutes(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const handler = routes[url.pathname];
  if (handler) {
    return handler(req);
  }
  return null;
}
