import {
  entityEnteredEventSchema,
  entityLeftEventSchema,
  formatEntityEnteredText,
  formatEntityLeftText,
  renderClassicSegments,
  schemaVersion,
  type EntityEnteredEvent,
  type EntityLeftEvent,
} from "@greenwood/contracts";
import type { Character, EngineRuntime } from "./state.js";

export type OccupantNotice = {
  characterId: string;
  event: EntityEnteredEvent | EntityLeftEvent;
};

const oppositeDirection: Record<string, string> = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
  up: "down",
  down: "up",
};

export function arrivalDirection(leaveDirection: string): string | undefined {
  return oppositeDirection[leaveDirection];
}

export function enteredNotices(
  observers: readonly Character[],
  actor: Character,
  roomId: string,
  runtime: EngineRuntime,
  fromDirection?: string,
): OccupantNotice[] {
  return observers.map((observer) => {
    const payload = {
      characterId: actor.id,
      name: actor.name,
      roomId,
      ...(fromDirection ? { direction: fromDirection } : {}),
    };
    const narration = formatEntityEnteredText(payload);
    const segments = fromDirection
      ? [
          { kind: "actor" as const, id: actor.id, text: actor.name },
          { kind: "text" as const, text: ` arrives from the ${fromDirection}.` },
        ]
      : [
          { kind: "actor" as const, id: actor.id, text: actor.name },
          { kind: "text" as const, text: " arrives." },
        ];
    if (renderClassicSegments(segments) !== narration) {
      throw new Error("classic segments drifted from entity.entered narration");
    }
    const event = entityEnteredEventSchema.parse({
      eventId: runtime.nextEventId(),
      sequence: runtime.nextSequence(observer.id),
      schemaVersion,
      type: "entity.entered",
      occurredAt: runtime.now().toISOString(),
      audience: "character",
      roomId,
      narration,
      segments,
      payload,
    } satisfies EntityEnteredEvent);
    return { characterId: observer.id, event };
  });
}

export function leftNotices(
  observers: readonly Character[],
  actor: Character,
  roomId: string,
  runtime: EngineRuntime,
  direction?: string,
): OccupantNotice[] {
  return observers.map((observer) => {
    const payload = {
      characterId: actor.id,
      name: actor.name,
      roomId,
      ...(direction ? { direction } : {}),
    };
    const narration = formatEntityLeftText(payload);
    const segments = direction
      ? [
          { kind: "actor" as const, id: actor.id, text: actor.name },
          { kind: "text" as const, text: ` leaves ${direction}.` },
        ]
      : [
          { kind: "actor" as const, id: actor.id, text: actor.name },
          { kind: "text" as const, text: " has left." },
        ];
    if (renderClassicSegments(segments) !== narration) {
      throw new Error("classic segments drifted from entity.left narration");
    }
    const event = entityLeftEventSchema.parse({
      eventId: runtime.nextEventId(),
      sequence: runtime.nextSequence(observer.id),
      schemaVersion,
      type: "entity.left",
      occurredAt: runtime.now().toISOString(),
      audience: "character",
      roomId,
      narration,
      segments,
      payload,
    } satisfies EntityLeftEvent);
    return { characterId: observer.id, event };
  });
}
