import {
  playStateSchema,
  resolveAppearance,
  resolveVisualGender,
  type PlayState,
} from "@greenwood/contracts";
import {
  activeEncounter,
  DEFAULT_PLAYER_MAX_HEALTH,
  DEFAULT_PLAYER_MAX_FOCUS,
} from "./combat-state.js";
import { fixturesVisibleTo, porterCompanionFixture, PORTER_NPC_ID } from "./arrival-guide.js";
import { treeNode } from "./conversation.js";
import { itemsHeldBy } from "./items.js";
import { snapshotPayload } from "./look.js";
import { schoolKit } from "./schools.js";
import type { Character, WorldState } from "./state.js";

/** Read-only projection. No accounts, hidden rooms, or other players' private stats. */
export function createPlayState(
  world: WorldState,
  characterId: string,
  options?: { presentIds?: readonly string[] },
): PlayState | undefined {
  const character = world.characters[characterId];
  const room = character && world.rooms[character.roomId];
  if (!character || !room) return undefined;
  const equipped = character.equippedItemId
    ? (Object.values(world.items ?? {}).find(
        (item) =>
          item.id === character.equippedItemId || item.templateId === character.equippedItemId,
      )?.name ?? world.itemTemplates?.[character.equippedItemId]?.name)
    : undefined;
  const discovered = new Set([...character.discoveredRoomIds, room.id]);
  const mappedRooms = Object.values(world.rooms).filter((candidate) => candidate.map);
  const mappedIds = new Set(mappedRooms.map((candidate) => candidate.id));
  return playStateSchema.parse({
    minimap: {
      rooms: mappedRooms.map((candidate) => {
        const current = candidate.id === room.id;
        const known = discovered.has(candidate.id);
        return {
          id: candidate.id,
          ...candidate.map!,
          state: current ? "current" : known ? "explored" : "unknown",
          ...(current || known ? { title: candidate.title } : {}),
        };
      }),
      paths: mappedRooms.flatMap((candidate) =>
        candidate.exits
          .filter((exit) => mappedIds.has(exit.toRoomId))
          .map((exit) => ({ from: candidate.id, to: exit.toRoomId })),
      ),
    },
    character: {
      id: character.id,
      name: character.name,
      visual: {
        speciesId: character.speciesId ?? "unknown",
        gender: resolveVisualGender(character.gender),
        appearance: resolveAppearance(character.appearance),
      },
      health: character.health ?? DEFAULT_PLAYER_MAX_HEALTH,
      maxHealth: character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      focus: character.focus ?? DEFAULT_PLAYER_MAX_FOCUS,
      maxFocus: character.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS,
      level: character.level ?? 1,
      experience: character.experience ?? 0,
      inCombat: Boolean(activeEncounter(world, characterId)),
      equipped,
      schoolId: character.schoolId,
      gift:
        (character.level ?? 1) >= 3
          ? (() => {
              const kit = schoolKit(world, character);
              const gift = kit[0];
              return gift ? { id: gift.id, name: gift.name, helpText: gift.helpText } : undefined;
            })()
          : undefined,
      gifts: schoolKit(world, character).map((spell) => ({
        id: spell.id,
        name: spell.name,
        helpText: spell.helpText,
      })),
    },
    // Older world fixtures omit these collections. The shared look helpers lazily
    // initialise them, so isolate that initialisation from this read-only projection.
    room: snapshotPayload(
      room,
      { ...world, items: world.items ?? {}, enemies: world.enemies ?? {} },
      character,
    ),
    peers: (options?.presentIds ?? [])
      .filter((id) => id !== characterId)
      .flatMap((id) => {
        const other = world.characters[id];
        if (!other) return [];
        const theirRoom = world.rooms[other.roomId];
        return [
          {
            id: other.id,
            name: other.name,
            visual: {
              speciesId: other.speciesId ?? "unknown",
              gender: resolveVisualGender(other.gender),
              appearance: resolveAppearance(other.appearance),
            },
            ...(theirRoom && discovered.has(theirRoom.id) ? { roomTitle: theirRoom.title } : {}),
          },
        ];
      }),
    conversation: conversationSnapshot(world, character),
    bag: itemsHeldBy(world, character.id).map((item) => ({
      id: item.id,
      name: item.name,
      equipped:
        character.equippedItemId === item.id || character.equippedItemId === item.templateId,
      ...(item.category && item.category !== "ordinary" ? { category: item.category } : {}),
    })),
    quests: questJournal(world, character.id),
  });
}

function questJournal(world: WorldState, characterId: string) {
  const progressById = world.quests?.[characterId] ?? {};
  return Object.values(world.questTemplates ?? {})
    .flatMap((template) => {
      const progress = progressById[template.id];
      if (!progress) {
        return [];
      }
      return [
        {
          id: template.id,
          title: template.title,
          status: progress.status,
          steps: template.objectives.map((objective) => ({
            id: objective.id,
            done: progress.completedObjectiveIds.includes(objective.id),
            ...splitQuestStep(objective.label),
          })),
        },
      ];
    })
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "active" ? -1 : 1;
      }
      return left.title.localeCompare(right.title);
    });
}

function splitQuestStep(raw: string): { label: string; hint?: string } {
  const match = raw.match(/^(.*?)\s+(Type\s.+)$/iu);
  if (!match?.[1] || !match[2]) {
    return { label: raw };
  }
  return { label: match[1].replace(/\.$/u, ""), hint: match[2] };
}

function conversationSnapshot(world: WorldState, character: Character) {
  const open = character.openConversation;
  if (!open) {
    return undefined;
  }
  const npc = fixtureForTalk(world, character, open.npcId);
  if (!npc) {
    return undefined;
  }
  const node =
    open.nodeId && npc.dialogueTree ? treeNode(npc.dialogueTree, open.nodeId) : undefined;
  const prompt = node?.text ?? npc.dialogue;
  if (!prompt) {
    return undefined;
  }
  return {
    npcId: npc.id,
    npcName: npc.name,
    prompt,
    choices: (node?.choices ?? []).map((choice) => ({ say: choice.say, label: choice.label })),
  };
}

function fixtureForTalk(world: WorldState, character: Character, npcId: string) {
  const nearby = fixturesVisibleTo(world, character).find((fixture) => fixture.id === npcId);
  if (nearby) {
    return nearby;
  }
  for (const room of Object.values(world.rooms)) {
    const authored = room.fixtures.find((fixture) => fixture.id === npcId);
    if (authored) {
      return authored;
    }
  }
  return npcId === PORTER_NPC_ID ? porterCompanionFixture(world) : undefined;
}
