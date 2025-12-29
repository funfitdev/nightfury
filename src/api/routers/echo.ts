import { z } from "zod/v4";
import { orpc, type ApiContext } from "../context";

// Input types
type EchoInput = { body: { message: string } };

// Output types
type EchoOutput = { message: string; requestId: string; timestamp: string };

// Handlers
function echoHandler({ input, context }: { input: EchoInput; context: ApiContext }): EchoOutput {
  return {
    message: input.body.message,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  };
}

// Procedure (not a router, since it's a single endpoint)
export const echoProcedure = orpc
  .route({ method: "POST", path: "/api/echo", inputStructure: "detailed" })
  .input(z.object({ body: z.object({ message: z.string() }) }))
  .output(z.object({
    message: z.string(),
    requestId: z.string(),
    timestamp: z.string(),
  }))
  .handler(echoHandler);
