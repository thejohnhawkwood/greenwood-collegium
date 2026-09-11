import type { EventEnvelope } from "@greenwood/contracts";
import { ARRIVAL_QUEST_ID } from "./arrival.js";
import { formatDialogueNode, treeNode } from "./conversation.js";
import { worldItems } from "./items.js";
import type { Character, EngineRuntime, RoomFixture, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export const ARRIVAL_KEY_TEMPLATE_ID = "small-copper-key";
export const ARRIVAL_KEY_NAME = "Small Copper Key";
export const PORTER_NPC_ID = "npc-porter-bramble";
export const PORTER_NPC_NAME = "Porter Bramble";

export const PORTER_TAKE_HINT =
  'Porter Bramble holds the Small Copper Key in his paw. "Type take key."';

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
    return 'Porter Bramble holds out the key. "Type take key when you are ready."';
  }
  if (!done.has("arrive")) {
    return 'Porter Bramble points north. "Type north to reach the Great Hall."';
  }
  return undefined;
}

export function porterCompanionFixture(world: WorldState): RoomFixture {
  const authored = authoredPorter(world);
  return {
    id: PORTER_NPC_ID,
    name: PORTER_NPC_NAME,
    kind: "npc",
    lookDescription:
      "Porter Bramble walks with you, brass whistle ready, determined not to lose you.",
    examineDescription:
      "Porter stays at your side until Arrival is finished. He is a hedgehog in a too-large coat, and he will mention the next command in every doorway.",
    dialogue:
      authored?.dialogue ??
      '"This is a school. We train woodland students to face real dangers in the Greenwood. Typed commands are how you learn."',
    dialogueTree: authored?.dialogueTree,
  };
}

function authoredPorter(world: WorldState): RoomFixture | undefined {
  return world.rooms["lantern-court"]?.fixtures.find((fixture) => fixture.id === PORTER_NPC_ID);
}

export function arrivalCompletesInRoom(
  world: WorldState,
  characterId: string,
  roomId: string,
): boolean {
  const remaining = remainingArrivalObjectives(world, characterId);
  const last = remaining[0];
  return remaining.length === 1 && last?.kind === "visit" && last.roomId === roomId;
}

export function promptPorterAfterMove(
  world: WorldState,
  character: Character,
  destinationRoomId: string,
  runtime: EngineRuntime,
): EventEnvelope | undefined {
  if (!arrivalQuestActive(world, character.id)) {
    return undefined;
  }
  if (arrivalCompletesInRoom(world, character.id, destinationRoomId)) {
    return undefined;
  }
  const porter = fixturesVisibleTo(world, character).find(
    (fixture) => fixture.id === PORTER_NPC_ID,
  );
  const tree = porter?.dialogueTree;
  const nodeId = porterNagNodeId(world, character.id, tree);
  const node = tree && nodeId ? treeNode(tree, nodeId) : undefined;
  if (porter && tree && node && nodeId) {
    character.openConversation = { npcId: porter.id, nodeId };
    return systemNotice(character.id, formatDialogueNode(porter.name, node), runtime);
  }
  const coach = nextArrivalCoach(world, character.id);
  if (!coach) {
    return undefined;
  }
  return systemNotice(character.id, coach, runtime);
}

function remainingArrivalObjectives(world: WorldState, characterId: string) {
  const template = world.questTemplates?.[ARRIVAL_QUEST_ID];
  const progress = world.quests?.[characterId]?.[ARRIVAL_QUEST_ID];
  if (!template || !progress || progress.status !== "active") {
    return [];
  }
  return template.objectives.filter(
    (objective) => !progress.completedObjectiveIds.includes(objective.id),
  );
}

function porterNagNodeId(
  world: WorldState,
  characterId: string,
  tree: RoomFixture["dialogueTree"],
): string | undefined {
  if (!tree) {
    return undefined;
  }
  const nextId = remainingArrivalObjectives(world, characterId)[0]?.id;
  const preferred = nextId ? `nag-${nextId}` : undefined;
  if (preferred && tree.nodes[preferred]) {
    return preferred;
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function characterArrivalKeyIsUntaken(world: WorldState, characterId: string): boolean {
  return Object.values(worldItems(world)).some(
    (item) =>
      item.templateId === ARRIVAL_KEY_TEMPLATE_ID &&
      !item.holderCharacterId &&
      (item.availableToCharacterId === undefined || item.availableToCharacterId === characterId),
  );
}

export function fixturesVisibleTo(world: WorldState, character: Character): RoomFixture[] {
  const room = world.rooms[character.roomId];
  const fixtures = [...(room?.fixtures ?? [])];
  const visible =
    arrivalQuestActive(world, character.id) &&
    !fixtures.some((fixture) => fixture.id === PORTER_NPC_ID)
      ? [...fixtures, porterCompanionFixture(world)]
      : fixtures;
  return visible.map((fixture) => overlayPorterKeyState(world, character.id, fixture));
}

function overlayPorterKeyState(
  world: WorldState,
  characterId: string,
  fixture: RoomFixture,
): RoomFixture {
  if (fixture.id !== PORTER_NPC_ID) {
    return fixture;
  }
  const holding = characterArrivalKeyIsUntaken(world, characterId);
  return {
    ...fixture,
    lookDescription: porterLookDescription(fixture.lookDescription, holding),
    examineDescription: porterExamineDescription(fixture.examineDescription, holding),
  };
}

function porterLookDescription(
  authored: string | undefined,
  holdingKey: boolean,
): string | undefined {
  const base = stripKeyFromPorterText(authored);
  if (!holdingKey) {
    return base;
  }
  if (!base) {
    return "Small Copper Key in his paw.";
  }
  return `${base.replace(/\.$/u, "")}, Small Copper Key in his paw.`;
}

function porterExamineDescription(
  authored: string | undefined,
  holdingKey: boolean,
): string | undefined {
  const base = stripKeyFromPorterText(authored);
  if (!holdingKey) {
    return base;
  }
  const hint = "He holds a Small Copper Key for you. Type take key.";
  if (!base) {
    return hint;
  }
  return `${base.replace(/\.$/u, "")}. ${hint}`;
}

function stripKeyFromPorterText(text: string | undefined): string | undefined {
  if (!text) {
    return text;
  }
  return text
    .replace(/,?\s*(?:holding\s+)?(?:a\s+)?Small Copper Key(?:\s+in\s+\w+\s+paw)?\.?/giu, "")
    .replace(/\s*He holds a Small Copper Key[^.]*\./giu, "")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/,$/u, "")
    .replace(/\s+\./gu, ".");
}

export function arrivalWalkNarration(destinationTitle: string): string {
  return `Porter Bramble walks with you into the ${destinationTitle}, already clearing his throat.`;
}
