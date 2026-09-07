import {
  eventEnvelopeSchema,
  renderClassicSegments,
  schemaVersion,
  type EventEnvelope,
} from "@greenwood/contracts";
import { enemiesInRoom } from "./enemies.js";
import { itemsHeldBy, itemsInRoom } from "./items.js";
import type { EngineRuntime, ExamineIntent, RoomFixture, WorldState } from "./state.js";

export type ExamineSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type ExamineFailure = {
  ok: false;
  code: "character_not_found" | "item_not_found" | "item_ambiguous";
  message: string;
};

export type ExamineResult = ExamineSuccess | ExamineFailure;

type ExamineTarget = {
  id: string;
  name: string;
  description: string;
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

  const room = world.rooms[character.roomId];
  const nearby: ExamineTarget[] = [
    ...(room?.fixtures ?? []).filter(hasExamineText).map((fixture) => ({
      id: fixture.id,
      name: fixture.name,
      description: fixture.examineDescription,
    })),
    ...enemiesInRoom(world, character.roomId).map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      description: enemy.examineDescription,
    })),
    ...[...itemsInRoom(world, character.roomId), ...itemsHeldBy(world, character.id)].map(
      (item) => ({
        id: item.id,
        name: item.name,
        description: item.examineDescription,
      }),
    ),
    ...Object.values(world.characters)
      .filter((other) => other.roomId === character.roomId && other.id !== character.id)
      .map((other) => ({
        id: other.id,
        name: other.name,
        description: `${other.name} is a Collegian standing nearby.`,
      })),
  ];

  const matches = matchExamineTargets(nearby, intent.target);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }
  if (matches.length > 1) {
    const names = matches.map((target) => target.name).join(", ");
    return {
      ok: false,
      code: "item_ambiguous",
      message: `Which did you mean: ${names}?`,
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
    { kind: "actor" as const, id: target.id, text: target.name },
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

  return { ok: true, event };
}

function hasExamineText(
  fixture: RoomFixture,
): fixture is RoomFixture & { examineDescription: string } {
  return Boolean(fixture.examineDescription);
}

function matchExamineTargets(
  candidates: readonly ExamineTarget[],
  target: string,
): ExamineTarget[] {
  const needle = target.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return candidates.filter((candidate) => {
    const name = candidate.name.toLowerCase();
    return candidate.id === needle || name === needle || name.includes(needle);
  });
}
