export type InviteStep = "forms" | "story" | "account";

export function stepAfterInvite(role: string): InviteStep {
  return role === "student" ? "story" : "account";
}

export function nextOpeningScroll(
  current: number,
  scrollHeight: number,
  clientHeight: number,
  paused: boolean,
): number {
  if (paused) {
    return current;
  }
  const max = Math.max(0, scrollHeight - clientHeight);
  return Math.min(max, current + 1);
}

export function openingScrollPaused(programmed: number, actual: number): boolean {
  return actual < programmed - 4;
}
