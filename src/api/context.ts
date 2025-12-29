import { os } from "@orpc/server";

export interface ApiContext {
  requestId: string;
}

export const orpc = os.$context<ApiContext>();
