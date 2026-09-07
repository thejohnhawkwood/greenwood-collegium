export const MAX_LEVEL = 10;
export const EXPERIENCE_PER_LEVEL = 10;

export function levelForExperience(experience: number): number {
  const safe = Number.isFinite(experience) ? Math.max(0, Math.floor(experience)) : 0;
  return Math.min(MAX_LEVEL, 1 + Math.floor(safe / EXPERIENCE_PER_LEVEL));
}
