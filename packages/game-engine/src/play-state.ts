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
import { fixturesVisibleTo } from "./arrival-guide.js";
import { treeNode } from "./conversation.js";
import { itemsHeldBy } from "./items.js";
import { snapshotPayload } from "./look.js";
import { combatMoves } from "./combat-lock.js";
import { encounterForViewer } from "./combat-party.js";
import { DUEL_CHALLENGE_ID } from "./duel.js";
import { primerPlayState } from "./primer-book.js";
import { equipmentSheet, wornSlotId } from "./equipment-slots.js";
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
  const encounter = activeEncounter(world, characterId);
  const primer = primerPlayState(world, character);
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
          x: candidate.map!.x,
          y: candidate.map!.y,
          z: candidate.map!.z ?? 0,
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
      inCombat: Boolean(encounter),
      equipped,
      schoolId: character.schoolId,
      gift: (() => {
        const kit = schoolKit(world, character);
        const gift = kit[0];
        return gift ? { id: gift.id, name: gift.name, helpText: gift.helpText } : undefined;
      })(),
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
    encounter: encounter
      ? (() => {
          const viewed = encounterForViewer(world, encounter, characterId);
          return {
            id: viewed.id,
            round: viewed.round,
            status: "awaiting_intents" as const,
            lockDeadlineAt: viewed.lockDeadlineAt,
            enemy: {
              id: viewed.enemy.id,
              name: viewed.enemy.name,
              health: viewed.enemy.health,
              maxHealth: viewed.enemy.maxHealth,
              focus: viewed.enemy.focus,
              maxFocus: viewed.enemy.maxFocus,
            },
            moves: combatMoves(world, character),
          };
        })()
      : undefined,
    conversation: conversationSnapshot(world, character),
    ...(outgoingDuelAsk(world, character) ?? {}),
    ...(primer ? { primer } : {}),
    slots: equipmentSheet(world, character),
    bag: itemsHeldBy(world, character.id).map((item) => {
      const slot = wornSlotId(world, character, item.id);
      return {
        id: item.id,
        name: item.name,
        equipped: slot !== undefined,
        ...(item.category && item.category !== "ordinary" ? { category: item.category } : {}),
        ...(item.examineDescription ? { description: item.examineDescription } : {}),
        ...(slot ? { slot } : {}),
      };
    }),
    quests: questJournal(world, character.id),
  });
}

function questRewardLine(
  world: WorldState,
  template: NonNullable<WorldState["questTemplates"]>[string],
): string {
  const experience = `${String(template.experienceReward)} experience`;
  const itemName = template.itemRewardTemplateId
    ? world.itemTemplates?.[template.itemRewardTemplateId]?.name
    : undefined;
  return itemName ? `${experience}. ${itemName}.` : experience;
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
          reward: questRewardLine(world, template),
          ...(progress.status === "active"
            ? (() => {
                const current = splitQuestStep(
                  template.objectives.find(
                    (objective) => !progress.completedObjectiveIds.includes(objective.id),
                  )?.label ?? "",
                ).label;
                return current ? { current } : {};
              })()
            : {}),
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

function outgoingDuelAsk(
  world: WorldState,
  character: Character,
): { duelAsk: { name: string } } | undefined {
  const askedId = Object.entries(world.duelChallenges ?? {}).find(
    ([, challenge]) => challenge.fromId === character.id,
  )?.[0];
  const asked = askedId ? world.characters[askedId] : undefined;
  return asked ? { duelAsk: { name: asked.name } } : undefined;
}

function conversationSnapshot(world: WorldState, character: Character) {
  const challenge = world.duelChallenges?.[character.id];
  if (challenge) {
    const from = world.characters[challenge.fromId];
    return {
      npcId: DUEL_CHALLENGE_ID,
      npcName: from?.name ?? "Classmate",
      prompt: `${from?.name ?? "A classmate"} asks for a classroom duel. Both of you must agree.`,
      choices: [
        { say: "1", label: "Accept the duel" },
        { say: "2", label: "Decline" },
      ],
    };
  }
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
  return fixturesVisibleTo(world, character).find((fixture) => fixture.id === npcId);
}
