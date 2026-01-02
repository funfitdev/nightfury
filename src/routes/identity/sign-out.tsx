import { sessionManager, redirectWithCookie } from "@/lib/session";

export async function POST(req: Request) {
  const cookie = await sessionManager.destroySession(req);
  return redirectWithCookie("/identity/sign-in", cookie, 303);
}
