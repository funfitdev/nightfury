import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIGenerator } from "@orpc/openapi";
import { orpc, type ApiContext } from "./context";
import { healthRouter, userRouter, postRouter, echoProcedure } from "./routers";

// Combine all routers into the main app router
export const appRouter = orpc.router({
  health: healthRouter,
  user: userRouter,
  post: postRouter,
  echo: echoProcedure,
});

// Export router type for client usage
export type AppRouter = typeof appRouter;

// Create OpenAPI handler for REST endpoints
const openAPIHandler = new OpenAPIHandler(appRouter);

// Generate OpenAPI spec lazily to avoid startup errors
let openAPISpec: ReturnType<typeof openAPIGenerator.generate> | null = null;
const openAPIGenerator = new OpenAPIGenerator({ schemaConverters: [] });

export function getOpenAPISpec() {
  if (!openAPISpec) {
    try {
      openAPISpec = openAPIGenerator.generate(appRouter, {
        info: {
          title: "mwm API",
          version: "1.0.0",
          description: "RESTful API built with oRPC and Bun",
        },
        servers: [{ url: "/api" }],
      });
    } catch (e) {
      console.error("OpenAPI generation error:", e);
      return { error: "Failed to generate OpenAPI spec" };
    }
  }
  return openAPISpec;
}

// REST API request handler for Bun
export async function handleAPI(req: Request): Promise<Response> {
  const context: ApiContext = { requestId: crypto.randomUUID() };
  const { matched, response } = await openAPIHandler.handle(req, { context });

  if (matched) {
    return response;
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

// Re-export context and schemas for external use
export { orpc, type ApiContext } from "./context";
export * from "./schemas";
