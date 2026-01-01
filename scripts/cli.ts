import { Glob, $ } from "bun";
import { watch } from "fs";
import { resolve } from "path";

const projectRoot = resolve(import.meta.dir, "..");

// Generate routes with full routing logic (context, HTTP methods, partials)
async function generateRoutes() {
  const glob = new Glob("**/*.tsx");
  const routesDir = import.meta.dir + "/../src/routes";

  const routes: { path: string; importPath: string }[] = [];

  for await (const file of glob.scan(routesDir)) {
    if (file.startsWith("__")) continue;

    let route = file.replace(/\.tsx$/, "");

    if (route === "index") {
      route = "/";
    } else if (route.endsWith("/index")) {
      route = "/" + route.replace(/\/index$/, "");
    } else {
      route = "/" + route.replace(/\./g, "/");
    }

    // Convert $param to :param for dynamic route segments
    route = route.replace(/\/\$([^/]+)/g, "/:$1");

    routes.push({
      path: route,
      importPath: `./routes/${file.replace(/\.tsx$/, "")}`,
    });
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  const imports = routes
    .map((r, i) => `import * as Route${i} from "${r.importPath}";`)
    .join("\n");
  const routeEntries = routes
    .map((r, i) => `  "${r.path}": createRouteHandler(Route${i}),`)
    .join("\n");

  const content = `// Auto-generated - do not edit
import { renderToReadableStream } from "react-dom/server";
import Root from "./routes/__Root";
import {
  runWithContext,
  createGuestSession,
  type RequestContext,
  type AuthSession,
} from "./context";

// Import route modules
${imports}

// HTTP method handler type
type MethodHandler = (req: Request) => Response | React.ReactElement | Promise<Response | React.ReactElement>;

// Route module type
type RouteModule = {
  default?: React.ComponentType;
  GET?: React.ComponentType | MethodHandler;
  POST?: MethodHandler;
  PUT?: MethodHandler;
  DELETE?: MethodHandler;
};

// Bun route handler type
type BunRouteHandler =
  | ((req: Request) => Response | Promise<Response>)
  | {
      GET?: (req: Request) => Response | Promise<Response>;
      POST?: (req: Request) => Response | Promise<Response>;
      PUT?: (req: Request) => Response | Promise<Response>;
      DELETE?: (req: Request) => Response | Promise<Response>;
    };

// Get auth session from request (implement your actual auth logic here)
async function getAuthSession(_req: Request): Promise<AuthSession> {
  // TODO: Implement actual session lookup from cookies/headers
  // Example:
  // const sessionToken = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
  // if (sessionToken) {
  //   const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
  //   if (session && session.expiresAt > new Date()) {
  //     return { userId: session.userId, user: session.user, isAuthenticated: true };
  //   }
  // }
  return createGuestSession();
}

// Create request context for a request
async function createRequestContext(
  req: Request & { params?: Record<string, string> }
): Promise<RequestContext> {
  const url = new URL(req.url);
  const session = await getAuthSession(req);
  const params = req.params ?? {};
  return { request: req, url, params, searchParams: url.searchParams, session };
}

// Check if request wants partial content (HTMX or ?partial=yes)
function isPartialRequest(req: Request): boolean {
  const url = new URL(req.url);
  return (
    url.searchParams.get("partial") === "yes" ||
    req.headers.get("HX-Request") === "true"
  );
}

// Render a React component to a Response
async function renderComponent(
  Component: React.ComponentType,
  partial: boolean
): Promise<Response> {
  const element = partial ? <Component /> : <Root><Component /></Root>;
  const stream = await renderToReadableStream(element);
  return new Response(stream, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// Check if a handler is a React component (no parameters)
function isReactComponent(
  handler: React.ComponentType | MethodHandler
): handler is React.ComponentType {
  return typeof handler === "function" && handler.length === 0;
}

// Create a route handler that supports all HTTP methods
function createRouteHandler(module: RouteModule): BunRouteHandler {
  const hasMethodExports = module.GET || module.POST || module.PUT || module.DELETE;

  // If only default export exists, use simple handler
  if (!hasMethodExports && module.default) {
    return async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const partial = isPartialRequest(req);
        return renderComponent(module.default!, partial);
      });
    };
  }

  // Build method handlers object
  const handlers: Record<string, (req: Request) => Promise<Response>> = {};

  // GET handler: default export for full page, GET export for partials
  if (module.default || module.GET) {
    handlers.GET = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const partial = isPartialRequest(req);

        // If partial request and GET export exists, use it
        if (partial && module.GET) {
          if (isReactComponent(module.GET)) {
            return renderComponent(module.GET, true);
          }
          const result = await module.GET(req);
          if (result instanceof Response) {
            return result;
          }
          return renderComponent(() => result, true);
        }

        // Full page request - use default export
        if (module.default) {
          return renderComponent(module.default, false);
        }

        // Fallback to GET if no default
        if (module.GET) {
          if (isReactComponent(module.GET)) {
            return renderComponent(module.GET, partial);
          }
          const result = await module.GET(req);
          if (result instanceof Response) {
            return result;
          }
          return renderComponent(() => result, partial);
        }

        return new Response("Not Found", { status: 404 });
      });
    };
  }

  // POST handler
  if (module.POST) {
    handlers.POST = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const result = await module.POST!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render it as partial
        return renderComponent(() => result, true);
      });
    };
  }

  // PUT handler
  if (module.PUT) {
    handlers.PUT = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const result = await module.PUT!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render it as partial
        return renderComponent(() => result, true);
      });
    };
  }

  // DELETE handler
  if (module.DELETE) {
    handlers.DELETE = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const result = await module.DELETE!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render it as partial
        return renderComponent(() => result, true);
      });
    };
  }

  return handlers;
}

export const routes: Record<string, BunRouteHandler> = {
${routeEntries}
};

// Match a URL path against a route pattern with :param segments
function matchRoute(
  pattern: string,
  pathname: string
): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]!;
    const pathPart = pathParts[i]!;

    if (patternPart.startsWith(":")) {
      // Dynamic segment - extract param
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      // Static segment mismatch
      return null;
    }
  }

  return params;
}

// Find matching route and extract params
function findRoute(
  pathname: string
): { pattern: string; params: Record<string, string> } | null {
  // Try exact match first (faster for static routes)
  if (routes[pathname]) {
    return { pattern: pathname, params: {} };
  }

  // Try pattern matching for dynamic routes
  for (const pattern of Object.keys(routes)) {
    if (!pattern.includes(":")) continue;
    const params = matchRoute(pattern, pathname);
    if (params) {
      return { pattern, params };
    }
  }

  return null;
}

export async function handleUIRoutes(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const match = findRoute(url.pathname);

  if (!match) return null;

  const handler = routes[match.pattern]!;

  // Create a request with params attached
  const reqWithParams = Object.assign(req, { params: match.params });

  // If handler is a function, call it directly
  if (typeof handler === "function") {
    return handler(reqWithParams);
  }

  // Handler is an object with method handlers
  const method = req.method as "GET" | "POST" | "PUT" | "DELETE";
  const methodHandler = handler[method];

  if (methodHandler) {
    return methodHandler(reqWithParams);
  }

  // Method not allowed
  return new Response("Method Not Allowed", { status: 405 });
}
`;

  await Bun.write(import.meta.dir + "/../src/routes.generated.tsx", content);
  console.log(`✓ Generated ${routes.length} routes`);
}

// Build Tailwind CSS
function buildCSS(watchMode = false) {
  const args = [
    "bun",
    "tailwindcss",
    "-i",
    "src/styles/main.css",
    "-o",
    "public/styles.css",
  ];
  if (!watchMode) args.push("--minify");
  if (watchMode) args.push("--watch=always");

  return Bun.spawn(args, {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
}

// Build client-side JavaScript
async function buildJS(watchMode = false) {
  const entrypoint = resolve(projectRoot, "src/client/main.ts");

  async function bundle() {
    const result = await Bun.build({
      entrypoints: [entrypoint],
      outdir: resolve(projectRoot, "public"),
      naming: "bundle.js",
      minify: !watchMode,
      sourcemap: watchMode ? "inline" : "none",
      target: "browser",
    });

    if (!result.success) {
      console.error("JS build failed:", result.logs);
    } else {
      console.log("✓ Built JS bundle");
    }
    return result;
  }

  await bundle();

  if (watchMode) {
    const clientDir = resolve(projectRoot, "src/client");
    watch(clientDir, { recursive: true }, async (_event, filename) => {
      if (filename?.endsWith(".ts") || filename?.endsWith(".tsx")) {
        console.log(`\n📦 Client changed: ${filename}`);
        await bundle();
      }
    });
  }
}

// Dev mode
async function dev() {
  console.log("🚀 Starting development server...\n");

  await generateRoutes();
  await buildJS(true);

  const routesDir = import.meta.dir + "/../src/routes";
  const watcher = watch(
    routesDir,
    { recursive: true },
    async (_event, filename) => {
      if (filename?.endsWith(".tsx") && !filename.startsWith("__")) {
        console.log(`\n📁 Route changed: ${filename}`);
        await generateRoutes();
      }
    }
  );

  console.log("🎨 Starting Tailwind CSS...");
  const tailwind = buildCSS(true);

  await Bun.sleep(500);

  console.log("🔥 Starting Bun server with hot reload...\n");
  const server = Bun.spawn(["bun", "--hot", "./index.tsx"], {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down...");
    watcher.close();
    tailwind.kill();
    server.kill();
    process.exit(0);
  });

  await server.exited;
}

// Build mode
async function build() {
  console.log("📦 Building for production...\n");

  await generateRoutes();
  await buildJS(false);

  const tailwind = buildCSS(false);
  await tailwind.exited;
  console.log("✓ Built CSS");

  await $`cd ${projectRoot} && bun build ./index.tsx --compile --outfile=dist/server`;
  console.log("✓ Compiled server binary");

  console.log("\n✅ Build complete! Run with: ./dist/server");
}

// CLI
const command = process.argv[2];

switch (command) {
  case "dev":
    dev();
    break;
  case "build":
    build();
    break;
  default:
    console.log("Usage: bun scripts/cli.ts <dev|build>");
    process.exit(1);
}
