import {
  authSessionPublicSchema,
  authStatusSchema,
  type AuthSessionPublic,
  type AuthStatus,
} from "@greenwood/contracts";

export async function loadAuthSession(
  request: typeof fetch = fetch,
): Promise<{ status: AuthStatus; me?: AuthSessionPublic }> {
  const response = await request("/auth/status", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error("Session check unavailable");
  const status = authStatusSchema.parse(await response.json());
  if (!status.signedIn) return { status };
  const session = await request("/auth/me", { credentials: "same-origin", cache: "no-store" });
  if (session.status === 401 || session.status === 403)
    return { status: { ...status, signedIn: false } };
  if (!session.ok) throw new Error("Session check unavailable");
  return { status, me: authSessionPublicSchema.parse(await session.json()) };
}
