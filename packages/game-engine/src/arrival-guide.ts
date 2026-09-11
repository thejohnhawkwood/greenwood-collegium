import { ARRIVAL_QUEST_ID } from "./arrival.js";
import type { Character, RoomFixture, WorldState } from "./state.js";

export const ARRIVAL_KEY_TEMPLATE_ID = "small-copper-key";
export const ARRIVAL_KEY_NAME = "Small Copper Key";
export const PORTER_NPC_ID = "npc-porter-bramble";
export const PORTER_NPC_NAME = "Porter Bramble";

export const PORTER_TAKE_HINT =
  'Porter Bramble holds the Small Copper Key in his paw. "Type take Small Copper Key — all three words. I will not hand it over for take or take key."';

export function normalizeCommandName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/gu, " ");
}

export function isExactArrivalKeyName(target: string): boolean {
  return normalizeCommandName(target) === normalizeCommandName(ARRIVAL_KEY_NAME);
}

export function arrivalQuestActive(world: WorldState, characterId: string): boolean {
  return world.quests?.[characterId]?.[ARRIVAL_QUEST_ID]?.status === "active";
}

export function arrivalNeedsTake(world: WorldState, characterId: string): boolean {
  const progress = world.quests?.[characterId]?.[ARRIVAL_QUEST_ID];
  return progress?.status === "active" && !progress.completedObjectiveIds.includes("take");
}

export function nextArrivalCoach(world: WorldState, characterId: string): string | undefined {
  const progress = world.quests?.[characterId]?.[ARRIVAL_QUEST_ID];
  if (!progress || progress.status !== "active") {
    return undefined;
  }
  const done = new Set(progress.completedObjectiveIds);
  if (!done.has("look")) {
    return 'Porter Bramble nods. "Type look to see Lantern Court."';
  }
  if (!done.has("speak")) {
    return 'Porter Bramble waits. "Type say hello so I know you arrived."';
  }
  if (!done.has("take")) {
    return 'Porter Bramble holds out the key. "Type take Small Copper Key when you are ready."';
  }
  if (!done.has("arrive")) {
    return 'Porter Bramble points north. "Type north to reach the Great Hall."';
  }
  return undefined;
}

export function porterCompanionFixture(): RoomFixture {
  return {
    id: PORTER_NPC_ID,
    name: PORTER_NPC_NAME,
    kind: "npc",
    lookDescription: "Porter Bramble walks with you, brass whistle ready, Small Copper Key in paw.",
    examineDescription:
      "Porter stays at your side for Arrival. He is a hedgehog in a too-large coat. Type take Small Copper Key, then north to reach the Great Hall.",
    dialogue:
      '"This is a school. We train woodland students to face real dangers in the Greenwood. Typed commands are how you learn."',
  };
}

export function fixturesVisibleTo(world: WorldState, character: Character): RoomFixture[] {
  const room = world.rooms[character.roomId];
  const fixtures = [...(room?.fixtures ?? [])];
  if (!arrivalQuestActive(world, character.id)) {
    return fixtures;
  }
  if (fixtures.some((fixture) => fixture.id === PORTER_NPC_ID)) {
    return fixtures;
  }
  return [...fixtures, porterCompanionFixture()];
}

export function arrivalWalkNarration(destinationTitle: string): string {
  return `Porter Bramble walks with you into the ${destinationTitle}.`;
}
