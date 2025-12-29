import { z } from "zod/v4";
import { orpc } from "../context";

// Output types
type HealthCheckOutput = { status: "ok"; timestamp: string };

// Handlers
function checkHealth(): HealthCheckOutput {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

// Router
export const healthRouter = orpc.router({
  check: orpc
    .route({ method: "GET", path: "/api/health" })
    .output(z.object({ status: z.literal("ok"), timestamp: z.string() }))
    .handler(checkHealth),
});
