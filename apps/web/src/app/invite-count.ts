export function parseInviteCount(raw: string, max: number, fallback: number): number {
  if (raw.trim() === "") {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(1, parsed));
}
