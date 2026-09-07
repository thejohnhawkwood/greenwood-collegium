import {
  eventEnvelopeSchema,
  renderClassicSegments,
  schemaVersion,
  type EventEnvelope,
} from "@greenwood/contracts";
import { itemsHeldBy, itemsInRoom, matchItems } from "./items.js";
import type { EngineRuntime, ExamineIntent, WorldState } from "./state.js";

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

  const nearby = [...itemsInRoom(world, character.roomId), ...itemsHeldBy(world, character.id)];
  const matches = matchItems(nearby, intent.target);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }
  if (matches.length > 1) {
    const names = matches.map((item) => item.name).join(", ");
    return {
      ok: false,
      code: "item_ambiguous",
      message: `Which did you mean: ${names}?`,
    };
  }

  const item = matches[0];
  if (!item) {
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }

  const narration = `${item.name}\n\n${item.examineDescription}`;
  const segments = [
    { kind: "item" as const, id: item.id, text: item.name },
    { kind: "text" as const, text: `\n\n${item.examineDescription}` },
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
      itemId: item.id,
      templateId: item.templateId,
      name: item.name,
    },
  });

  return { ok: true, event };
}
