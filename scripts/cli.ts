import { Glob, $ } from "bun";
import { watch } from "fs";
import { resolve } from "path";

const projectRoot = resolve(import.meta.dir, "..");

// Content-Type mapping for static files
const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

// Generate static file routes from public directory
async function generateStaticRoutes(): Promise<string[]> {
  const glob = new Glob("**/*");
  const publicDir = resolve(projectRoot, "public");
  const staticFiles: string[] = [];

  for await (const file of glob.scan(publicDir)) {
    // Skip directories (only process files)
    const filePath = resolve(publicDir, file);
    const stat = await Bun.file(filePath).exists();
    if (!stat) continue;

    // Get the URL path (e.g., "styles.css" -> "/styles.css")
    const urlPath = "/" + file;
    staticFiles.push(urlPath);
  }

  return staticFiles;
}

// Generate routes with full routing logic (context, HTTP methods, partials)
async function generateRoutes() {
  const glob = new Glob("**/*.tsx");
  const routesDir = import.meta.dir + "/../src/routes";

  const routes: { path: string; importPath: string; layouts: string[] }[] = [];
  const layouts: Map<string, string> = new Map(); // directory path -> import path

  // First pass: collect all layout files
  for await (const file of glob.scan(routesDir)) {
    if (file.endsWith("_layout.tsx")) {
      // Get the directory this layout applies to
      const dir = file.replace(/\/?_layout\.tsx$/, "") || "";
      layouts.set(dir, `./routes/${file.replace(/\.tsx$/, "")}`);
    }
  }

  // Second pass: collect routes and their applicable layouts
  for await (const file of glob.scan(routesDir)) {
    // Skip special files
    if (file.startsWith("__")) continue;
    if (file.endsWith("_layout.tsx")) continue;
    // Skip files in folders starting with - (e.g., -components)
    if (file.includes("/-") || file.startsWith("-")) continue;

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

    // Find all layouts that apply to this route (from root to deepest)
    const fileDir = file.includes("/") ? file.substring(0, file.lastIndexOf("/")) : "";
    const applicableLayouts: string[] = [];

    // Check each parent directory for a layout
    const parts = fileDir.split("/").filter(Boolean);
    let currentDir = "";

    // Check root layout first
    if (layouts.has("")) {
      applicableLayouts.push(layouts.get("")!);
    }

    // Then check each nested directory
    for (const part of parts) {
      currentDir = currentDir ? `${currentDir}/${part}` : part;
      if (layouts.has(currentDir)) {
        applicableLayouts.push(layouts.get(currentDir)!);
      }
    }

    routes.push({
      path: route,
      importPath: `./routes/${file.replace(/\.tsx$/, "")}`,
      layouts: applicableLayouts,
    });
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  // Collect all unique layout imports
  const allLayouts = new Set<string>();
  for (const r of routes) {
    for (const layout of r.layouts) {
      allLayouts.add(layout);
    }
  }
  const layoutImports = Array.from(allLayouts);

  const imports = routes
    .map((r, i) => `import * as Route${i} from "${r.importPath}";`)
    .join("\n");

  const layoutImportsCode = layoutImports
    .map((l, i) => `import Layout${i} from "${l}";`)
    .join("\n");

  // Create a map from import path to Layout variable name
  const layoutVarMap = new Map(layoutImports.map((l, i) => [l, `Layout${i}`]));

  const routeEntries = routes
    .map((r, i) => {
      const layoutVars = r.layouts.map((l) => layoutVarMap.get(l)!);
      return `  "${r.path}": createRouteHandler(Route${i}, [${layoutVars.join(", ")}]),`;
    })
    .join("\n");

  // Generate static file routes
  const staticFiles = await generateStaticRoutes();

  const staticRoutesCode = staticFiles
    .map((urlPath) => {
      const ext = urlPath.substring(urlPath.lastIndexOf("."));
      const mimeType = mimeTypes[ext] || "application/octet-stream";
      const filePath = `./public${urlPath}`;
      return `  "${urlPath}": createStaticHandler("${filePath}", "${mimeType}"),`;
    })
    .join("\n");

  const content = `// Auto-generated - do not edit
import { renderToReadableStream } from "react-dom/server";
import Root from "./routes/__Root";
import {
  runWithContext,
  createGuestSession,
  type RequestContext,
  type AuthSession,
} from "@/lib/context";
import { getAuthSessionFromRequest } from "@/lib/context";
import { OutletProvider } from "@/components/outlet";

const isDev = process.env.NODE_ENV !== "production";

// Static file handler
function createStaticHandler(filePath: string, contentType: string) {
  return () =>
    new Response(Bun.file(filePath), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": isDev
          ? "no-cache"
          : "public, max-age=31536000, immutable",
      },
    });
}

// Import route modules
${imports}

// Import layout modules
${layoutImportsCode}

// HTTP method handler type
type MethodHandler = (req: Request) => Response | React.ReactElement | Promise<Response | React.ReactElement>;

// Route module type - default can now return Response or React component
type RouteModule = {
  default?: React.ComponentType | MethodHandler;
  GET?: React.ComponentType | MethodHandler;
  POST?: MethodHandler;
  PUT?: MethodHandler;
  DELETE?: MethodHandler;
};

// Layout component type - can be a React component or a handler that returns Response/Element
type LayoutComponent =
  | React.ComponentType
  | ((req: Request) => Response | React.ReactElement | Promise<Response | React.ReactElement>);

// Check if layout is a handler function (takes request parameter)
function isLayoutHandler(
  layout: LayoutComponent
): layout is (req: Request) => Response | React.ReactElement | Promise<Response | React.ReactElement> {
  return typeof layout === "function" && layout.length > 0;
}

// Bun route handler type
type BunRouteHandler =
  | ((req: Request) => Response | Promise<Response>)
  | {
      GET?: (req: Request) => Response | Promise<Response>;
      POST?: (req: Request) => Response | Promise<Response>;
      PUT?: (req: Request) => Response | Promise<Response>;
      DELETE?: (req: Request) => Response | Promise<Response>;
    };

// Get auth session from request cookies (async - validates against DB)
async function getAuthSession(req: Request): Promise<AuthSession> {
  return getAuthSessionFromRequest(req);
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

// Wrap content with layouts (innermost to outermost)
// Returns Response if any layout throws/returns Response, otherwise returns wrapped element
async function wrapWithLayouts(
  content: React.ReactElement,
  layouts: LayoutComponent[],
  req: Request
): Promise<Response | React.ReactElement> {
  let wrapped = content;
  // Apply layouts from innermost (last) to outermost (first)
  for (let i = layouts.length - 1; i >= 0; i--) {
    const layout = layouts[i]!;

    if (isLayoutHandler(layout)) {
      // Layout is a handler function - call it and check result
      // May throw Response (e.g., redirect for auth)
      try {
        const result = await layout(req);
        if (result instanceof Response) {
          // Layout returned a Response (e.g., redirect) - return it immediately
          return result;
        }
        // Layout returned a React element - wrap it with outlet
        wrapped = (
          <OutletProvider content={wrapped}>
            {result}
          </OutletProvider>
        );
      } catch (e) {
        // Support throwing Response for redirects
        if (e instanceof Response) {
          return e;
        }
        throw e;
      }
    } else {
      // Layout is a React component
      const Layout = layout;
      wrapped = (
        <OutletProvider content={wrapped}>
          <Layout />
        </OutletProvider>
      );
    }
  }
  return wrapped;
}

// Render a React component to a Response
async function renderComponent(
  Component: React.ComponentType,
  partial: boolean,
  layouts: LayoutComponent[] = [],
  req?: Request
): Promise<Response> {
  let element: React.ReactElement = <Component />;

  // Wrap with layouts if any
  if (layouts.length > 0 && req) {
    const wrapped = await wrapWithLayouts(element, layouts, req);
    if (wrapped instanceof Response) {
      // A layout returned a Response (e.g., redirect for auth)
      return wrapped;
    }
    element = wrapped;
  }

  // Wrap with Root for full page requests
  if (!partial) {
    element = <Root>{element}</Root>;
  }

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

// Check if a handler is a method handler (takes request parameter)
function isMethodHandler(
  handler: React.ComponentType | MethodHandler
): handler is MethodHandler {
  return typeof handler === "function" && handler.length > 0;
}

// Create a route handler that supports all HTTP methods
function createRouteHandler(
  module: RouteModule,
  layouts: LayoutComponent[] = []
): BunRouteHandler {
  const hasMethodExports = module.GET || module.POST || module.PUT || module.DELETE;

  // If only default export exists, use simple handler
  if (!hasMethodExports && module.default) {
    return async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const partial = isPartialRequest(req);

        // Check if default is a handler function vs component
        const defaultExport = module.default!;
        if (isMethodHandler(defaultExport)) {
          // It's a handler function that takes request
          const result = await defaultExport(req);
          if (result instanceof Response) {
            return result;
          }
          return renderComponent(() => result, partial, layouts, req);
        }

        // It's a React component
        return renderComponent(defaultExport as React.ComponentType, partial, layouts, req);
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
            return renderComponent(module.GET, true, layouts, req);
          }
          const result = await module.GET(req);
          if (result instanceof Response) {
            return result;
          }
          return renderComponent(() => result, true, layouts, req);
        }

        // Full page request - use default export
        if (module.default) {
          // Check if default is a handler function vs component
          const defaultExport = module.default;
          if (isMethodHandler(defaultExport)) {
            const result = await defaultExport(req);
            if (result instanceof Response) {
              return result;
            }
            return renderComponent(() => result, false, layouts, req);
          }
          return renderComponent(defaultExport as React.ComponentType, false, layouts, req);
        }

        // Fallback to GET if no default
        if (module.GET) {
          if (isReactComponent(module.GET)) {
            return renderComponent(module.GET, partial, layouts, req);
          }
          const result = await module.GET(req);
          if (result instanceof Response) {
            return result;
          }
          return renderComponent(() => result, partial, layouts, req);
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
        const partial = isPartialRequest(req);
        const result = await module.POST!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render with Root if not partial
        return renderComponent(() => result, partial, layouts, req);
      });
    };
  }

  // PUT handler
  if (module.PUT) {
    handlers.PUT = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const partial = isPartialRequest(req);
        const result = await module.PUT!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render with Root if not partial
        return renderComponent(() => result, partial, layouts, req);
      });
    };
  }

  // DELETE handler
  if (module.DELETE) {
    handlers.DELETE = async (req: Request): Promise<Response> => {
      const ctx = await createRequestContext(req);
      return runWithContext(ctx, async () => {
        const partial = isPartialRequest(req);
        const result = await module.DELETE!(req);
        if (result instanceof Response) {
          return result;
        }
        // Result is a React element, render with Root if not partial
        return renderComponent(() => result, partial, layouts, req);
      });
    };
  }

  return handlers;
}

// Static file routes
export const staticRoutes: Record<string, () => Response> = {
${staticRoutesCode}
};

export const routes: Record<string, BunRouteHandler> = {
  ...staticRoutes,
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
  console.log(`✓ Generated ${routes.length} routes, ${staticFiles.length} static files`);
}

// Build Tailwind CSS
function buildCSS(watchMode = false) {
  const args = [
    "bun",
    "tailwindcss",
    "-i",
    "src/globals.css",
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
  const server = Bun.spawn(["bun", "--hot", "./server.tsx"], {
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

  // Build server with production JSX runtime
  const result = await Bun.build({
    entrypoints: [resolve(projectRoot, "server.tsx")],
    outdir: resolve(projectRoot, "dist"),
    target: "bun",
    minify: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });

  if (!result.success) {
    console.error("Server build failed:", result.logs);
    process.exit(1);
  }

  // Compile the bundled output to a standalone binary
  await $`cd ${projectRoot} && bun build ./dist/server.js --compile --outfile=dist/server`;
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
