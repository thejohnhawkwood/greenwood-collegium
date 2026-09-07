import { eventEnvelopeSchema, schemaVersion, type EventEnvelope } from "@greenwood/contracts";
import type { EngineRuntime } from "./state.js";

export function systemNotice(
  characterId: string,
  narration: string,
  runtime: EngineRuntime,
): EventEnvelope {
  return eventEnvelopeSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(characterId),
    schemaVersion,
    type: "system.notice",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration,
    payload: {},
  });
}
