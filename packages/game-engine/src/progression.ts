export const MAX_LEVEL = 20;
export const HEALTH_PER_LEVEL = 4;
export const FOCUS_PER_LEVEL = 2;

/** Cumulative experience required to *reach* each lesson. Index is the lesson number. */
export const EXPERIENCE_TO_REACH: readonly number[] = [
  0, 0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400, 490, 590, 700, 820, 950, 1090, 1240, 1400,
  1570,
];

export function experienceToReach(level: number): number {
  const safe = Number.isFinite(level) ? Math.max(1, Math.min(MAX_LEVEL, Math.floor(level))) : 1;
  return EXPERIENCE_TO_REACH[safe] ?? 0;
}

export function experienceToNextLesson(level: number, experience: number): number | undefined {
  if (level >= MAX_LEVEL) {
    return undefined;
  }
  const safeXp = Number.isFinite(experience) ? Math.max(0, Math.floor(experience)) : 0;
  return Math.max(0, experienceToReach(level + 1) - safeXp);
}

export function levelForExperience(experience: number): number {
  const safe = Number.isFinite(experience) ? Math.max(0, Math.floor(experience)) : 0;
  let level = 1;
  for (let candidate = 2; candidate <= MAX_LEVEL; candidate += 1) {
    if (safe >= (EXPERIENCE_TO_REACH[candidate] ?? Number.POSITIVE_INFINITY)) {
      level = candidate;
    }
  }
  return level;
}

export function baseMaxHealthForLevel(level: number): number {
  const safe = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 20 + Math.max(0, safe - 1) * HEALTH_PER_LEVEL;
}

export function baseMaxFocusForLevel(level: number): number {
  const safe = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return 10 + Math.max(0, safe - 1) * FOCUS_PER_LEVEL;
}
