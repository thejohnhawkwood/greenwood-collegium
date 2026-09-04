import { authStatusSchema, type AuthStatus } from "@greenwood/contracts";

export type { AuthStatus };

export function defaultAuthStatus(): AuthStatus {
  return {
    signedIn: false,
    allowGuestPlay: true,
    bootstrapOpen: false,
  };
}

export function shouldShowAuthGate(status: AuthStatus, forceGate: boolean): boolean {
  if (status.signedIn) {
    return false;
  }
  if (forceGate) {
    return true;
  }
  return !status.allowGuestPlay;
}

export async function loadAuthStatus(): Promise<AuthStatus> {
  const response = await fetch("/auth/status", { credentials: "same-origin" });
  if (!response.ok) {
    return defaultAuthStatus();
  }
  const parsed = authStatusSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : defaultAuthStatus();
}
