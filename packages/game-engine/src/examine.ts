import {
  eventEnvelopeSchema,
  renderClassicSegments,
  schemaVersion,
  type EventEnvelope,
} from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { enemiesInRoom } from "./enemies.js";
import { itemTypeWord, itemsHeldBy, itemsInRoom, whichItemMessage } from "./items.js";
import { ensureCharacterStarterItems } from "./starter-items.js";
import { namesMatch } from "./names.js";
import type { Character, EngineRuntime, ExamineIntent, WorldState } from "./state.js";

export type ExamineSuccess = {
  ok: true;
  targetId: string;
  event: EventEnvelope;
};

export type ExamineFailure = {
  ok: false;
  code: "character_not_found" | "item_not_found" | "item_ambiguous";
  message: string;
};

export type ExamineResult = ExamineSuccess | ExamineFailure;

type ExamineTarget = {
  entityKind?: "npc" | "player";
  item?: boolean;
  id: string;
  name: string;
  description: string;
  aliases?: string[];
};

export function handleExamine(
  world: WorldState,
  intent: ExamineIntent,
  runtime: EngineRuntime,
): ExamineResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  ensureCharacterStarterItems(world, character.id);
  const nearby: ExamineTarget[] = [
    ...fixturesVisibleTo(world, character).map((fixture) => ({
      id: fixture.id,
      entityKind: fixture.kind === "npc" ? ("npc" as const) : undefined,
      item: fixture.kind === "object",
      name: fixture.name,
      description:
        fixture.examineDescription ??
        fixture.lookDescription ??
        `${fixture.name} is here. You notice nothing more from this distance.`,
    })),
    ...enemiesInRoom(world, character.roomId).map((enemy) => ({
      id: enemy.id,
      entityKind: "npc" as const,
      name: enemy.name,
      description: enemy.examineDescription ?? enemy.lookDescription,
    })),
    ...[
      ...itemsInRoom(world, character.roomId, character.id),
      ...itemsHeldBy(world, character.id),
    ].map((item) => ({
      id: item.id,
      item: true,
      name: item.name,
      description: item.examineDescription,
    })),
    ...Object.values(world.characters)
      .filter((other) => other.roomId === character.roomId && other.id !== character.id)
      .map((other) => ({
        id: other.id,
        entityKind: "player" as const,
        name: other.name,
        aliases: other.accountUsername ? [other.accountUsername] : undefined,
        description:
          other.examineDescription ??
          other.lookDescription ??
          `${other.name} is a Collegian standing nearby.`,
      })),
  ];

  const matches = matchExamineTargets(nearby, intent.target);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "item_not_found",
      message: missingExamineMessage(world, character, intent.target),
    };
  }
  if (matches.length > 1) {
    const itemMatches = matches.filter((target) => target.item);
    const typeWord =
      itemMatches.length === matches.length
        ? itemTypeWord({
            itemType: intent.target.trim().toLowerCase(),
            category: intent.target.trim().toLowerCase(),
          })
        : "item";
    return {
      ok: false,
      code: "item_ambiguous",
      message:
        itemMatches.length === matches.length
          ? whichItemMessage("examine", typeWord, matches)
          : `Which did you mean: ${matches.map((target) => target.name).join(", ")}?`,
    };
  }

  const target = matches[0];
  if (!target) {
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }

  const narration = `${target.name}\n\n${target.description}`;
  const segments = [
    {
      kind: target.item ? ("item" as const) : ("actor" as const),
      entityKind: target.entityKind,
      id: target.id,
      text: target.name,
    },
    { kind: "text" as const, text: `\n\n${target.description}` },
  ];
  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from examine narration");
  }

  const event = eventEnvelopeSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "system.notice",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration,
    segments,
    payload: {
      targetId: target.id,
      name: target.name,
    },
  });

  return { ok: true, event, targetId: target.id };
}

function matchExamineTargets(
  candidates: readonly ExamineTarget[],
  target: string,
): ExamineTarget[] {
  return candidates.filter((candidate) => targetMatches(candidate, target));
}

function targetMatches(candidate: ExamineTarget, target: string): boolean {
  if (namesMatch(candidate.name, candidate.id, target)) {
    return true;
  }
  return (candidate.aliases ?? []).some((alias) => namesMatch(alias, candidate.id, target));
}

function characterMatches(character: Character, target: string): boolean {
  return targetMatches(
    {
      id: character.id,
      name: character.name,
      aliases: character.accountUsername ? [character.accountUsername] : undefined,
      description: "",
    },
    target,
  );
}

function missingExamineMessage(world: WorldState, looker: Character, target: string): string {
  const elsewhere = findKnownElsewhere(world, looker, target);
  if (elsewhere.length !== 1 || !elsewhere[0]) {
    return `I do not see "${target}" here.`;
  }
  const found = elsewhere[0];
  if (found.kind === "player") {
    return `${found.name} is not here.`;
  }
  const roomTitle = world.rooms[found.roomId]?.title;
  return roomTitle ? `${found.name} is not here. Try ${roomTitle}.` : `${found.name} is not here.`;
}

function findKnownElsewhere(
  world: WorldState,
  looker: Character,
  target: string,
): Array<{ name: string; roomId: string; kind: "player" | "place" }> {
  const found: Array<{ name: string; roomId: string; kind: "player" | "place" }> = [];
  for (const room of Object.values(world.rooms)) {
    if (room.id === looker.roomId) {
      continue;
    }
    for (const fixture of room.fixtures) {
      if (namesMatch(fixture.name, fixture.id, target)) {
        found.push({ name: fixture.name, roomId: room.id, kind: "place" });
      }
    }
  }
  for (const enemy of Object.values(world.enemies ?? {})) {
    if (enemy.roomId === looker.roomId) {
      continue;
    }
    if (namesMatch(enemy.name, enemy.id, target)) {
      found.push({ name: enemy.name, roomId: enemy.roomId, kind: "place" });
    }
  }
  for (const other of Object.values(world.characters)) {
    if (other.id === looker.id || other.roomId === looker.roomId) {
      continue;
    }
    if (characterMatches(other, target)) {
      found.push({ name: other.name, roomId: other.roomId, kind: "player" });
    }
  }
  return found;
}
