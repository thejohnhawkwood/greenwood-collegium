export const MAX_LEVEL = 10;
export const EXPERIENCE_PER_LEVEL = 10;
export const HEALTH_PER_LEVEL = 4;
export const FOCUS_PER_LEVEL = 2;

export function levelForExperience(experience: number): number {
  const safe = Number.isFinite(experience) ? Math.max(0, Math.floor(experience)) : 0;
  return Math.min(MAX_LEVEL, 1 + Math.floor(safe / EXPERIENCE_PER_LEVEL));
}

export function baseMaxHealthForLevel(level: number): number {
  const safe = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 20 + Math.max(0, safe - 1) * HEALTH_PER_LEVEL;
}

export function baseMaxFocusForLevel(level: number): number {
  const safe = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 10 + Math.max(0, safe - 1) * FOCUS_PER_LEVEL;
}
