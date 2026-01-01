import { handleAPI, getOpenAPISpec } from "./src/api";
// Use generated routes for production builds (static imports)
// For dev, this file is generated before the build
import { routes } from "./src/routes.generated";

const isDev = process.env.NODE_ENV !== "production";

const server = Bun.serve({
  routes: {
    ...routes,
    // REST API routes (OpenAPI) - handles /api/health, /api/users/*, /api/posts/*, /api/echo
    "/api/*": handleAPI,
    // OpenAPI spec
    "/openapi.json": () => Response.json(getOpenAPISpec()),
    "/favicon.ico": Bun.file("./favicon.ico"),
    // Static assets with caching
    "/styles.css": () =>
      new Response(Bun.file("./public/styles.css"), {
        headers: {
          "Content-Type": "text/css",
          "Cache-Control": isDev
            ? "no-cache"
            : "public, max-age=31536000, immutable",
        },
      }),
    "/bundle.js": () =>
      new Response(Bun.file("./public/bundle.js"), {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": isDev
            ? "no-cache"
            : "public, max-age=31536000, immutable",
        },
      }),
  },
  fetch(req, server) {
    // Handle live reload WebSocket upgrade in dev mode
    if (isDev && new URL(req.url).pathname === "/__reload") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe("reload");
    },
    message() {},
    close(ws) {
      ws.unsubscribe("reload");
    },
  },
});

// Notify all clients to reload when server restarts (hot reload)
if (isDev) {
  server.publish("reload", "reload");
}

console.log(`Server running at ${server.url}`);
