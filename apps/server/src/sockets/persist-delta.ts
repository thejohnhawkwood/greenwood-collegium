/** What a command actually changed. Unchanged columns stay on disk. */

export type QuestStamp = {
  questId: string;
  status: string;
  completedObjectiveIds: readonly string[];
  rewardGranted: boolean;
  outcome?: string;
};

export type ProgressStamp = {
  roomId: string;
  discovered: string;
  experience: number;
  level: number;
  schoolId: string;
  defeated: string;
  equipment: string;
  primer: string;
  quests: ReadonlyMap<string, string>;
};

export type PersistDelta = {
  room: boolean;
  discovery: boolean;
  progress: boolean;
  school: boolean;
  defeated: boolean;
  equipment: boolean;
  primer: boolean;
  questIds: string[];
};

export function questStamp(record: QuestStamp): string {
  return `${record.status}|${record.completedObjectiveIds.join(",")}|${record.rewardGranted ? "1" : "0"}|${record.outcome ?? ""}`;
}

export function changedProgress(before: ProgressStamp, after: ProgressStamp): PersistDelta {
  const questIds: string[] = [];
  const ids = new Set([...before.quests.keys(), ...after.quests.keys()]);
  for (const id of ids) {
    if (before.quests.get(id) !== after.quests.get(id)) {
      questIds.push(id);
    }
  }
  return {
    room: before.roomId !== after.roomId,
    discovery: before.discovered !== after.discovered,
    progress: before.experience !== after.experience || before.level !== after.level,
    school: before.schoolId !== after.schoolId,
    defeated: before.defeated !== after.defeated,
    equipment: before.equipment !== after.equipment,
    primer: before.primer !== after.primer,
    questIds,
  };
}

export function fullPersistDelta(stamp: ProgressStamp): PersistDelta {
  return {
    room: true,
    discovery: true,
    progress: true,
    school: true,
    defeated: true,
    equipment: true,
    primer: true,
    questIds: [...stamp.quests.keys()],
  };
}

export function persistDeltaIsQuiet(delta: PersistDelta): boolean {
  return (
    !delta.room &&
    !delta.discovery &&
    !delta.progress &&
    !delta.school &&
    !delta.defeated &&
    !delta.equipment &&
    !delta.primer &&
    delta.questIds.length === 0
  );
}
