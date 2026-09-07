const STOP_WORDS = new Set(["the", "a", "an", "of"]);

export function namesMatch(name: string, id: string, needle: string): boolean {
  const target = needle.trim().toLowerCase();
  if (target.length === 0) {
    return false;
  }
  const full = name.toLowerCase();
  const stableId = id.toLowerCase();
  if (stableId === target || full === target || full.includes(target)) {
    return true;
  }
  const words = nameTokens(full);
  const parts = nameTokens(target);
  return parts.length > 0 && parts.every((part) => words.includes(part));
}

export function nameTokens(value: string): string[] {
  return value
    .split(/[^a-z0-9]+/iu)
    .map((part) => part.toLowerCase())
    .filter((part) => part.length > 0 && !STOP_WORDS.has(part));
}
