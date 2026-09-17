export const MAP_LEVEL_LABELS: Record<number, string> = {
  1: "Upper floor",
  0: "Grounds",
  [-1]: "Bell Stair",
  [-2]: "Below the Bell",
};

export function mapLevel(room: { z?: number }): number {
  return room.z ?? 0;
}

export function mapLevelLabel(level: number): string {
  return (
    MAP_LEVEL_LABELS[level] ??
    (level > 0 ? `Upper level ${String(level)}` : `Lower level ${String(Math.abs(level))}`)
  );
}

export function availableMapLevels(rooms: readonly { z?: number }[]): number[] {
  return [...new Set(rooms.map(mapLevel))].sort((left, right) => right - left);
}

export function nextMapLevel(
  levels: readonly number[],
  current: number,
  step: 1 | -1,
): number | undefined {
  const index = levels.indexOf(current);
  if (index < 0) {
    return undefined;
  }
  return levels[index - step];
}
