import {
  chatSaidEventSchema,
  formatChatSaidText,
  renderClassicSegments,
  schemaVersion,
  type ChatSaidEvent,
} from "@greenwood/contracts";
import { charactersInRoom } from "./occupants.js";
import { sanitizeSpeech, SAY_MAX_LENGTH } from "./speech.js";
import type { EngineRuntime, SayIntent, WorldState } from "./state.js";

export type ChatNotice = {
  characterId: string;
  event: ChatSaidEvent;
};

export type SaySuccess = {
  ok: true;
  events: ChatSaidEvent[];
  notices: ChatNotice[];
};

export type SayFailure = {
  ok: false;
  code: "character_not_found" | "room_not_found" | "empty_say" | "say_too_long";
  message: string;
};

export type SayResult = SaySuccess | SayFailure;

export function handleSay(world: WorldState, intent: SayIntent, runtime: EngineRuntime): SayResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const room = world.rooms[character.roomId];
  if (!room) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }

  const text = sanitizeSpeech(intent.text);
  if (text.length === 0) {
    return {
      ok: false,
      code: "empty_say",
      message: "Say what?",
    };
  }
  if (text.length > SAY_MAX_LENGTH) {
    return {
      ok: false,
      code: "say_too_long",
      message: `That is too long to say. Use at most ${String(SAY_MAX_LENGTH)} characters.`,
    };
  }

  const payload = {
    speakerId: character.id,
    speakerName: character.name,
    roomId: room.id,
    text,
  };

  const speakerEvent = chatEvent(payload, character.id, runtime);
  const notices = charactersInRoom(world, room.id, character.id).map((observer) => ({
    characterId: observer.id,
    event: chatEvent(payload, observer.id, runtime),
  }));

  return { ok: true, events: [speakerEvent], notices };
}

function chatEvent(
  payload: { speakerId: string; speakerName: string; roomId: string; text: string },
  listenerId: string,
  runtime: EngineRuntime,
): ChatSaidEvent {
  const narration = formatChatSaidText(payload, listenerId);
  const quoted = `"${payload.text}"`;
  const segments =
    listenerId === payload.speakerId
      ? [
          { kind: "text" as const, text: "You say, " },
          { kind: "text" as const, text: quoted },
        ]
      : [
          { kind: "actor" as const, id: payload.speakerId, text: payload.speakerName },
          { kind: "text" as const, text: " says, " },
          { kind: "text" as const, text: quoted },
        ];

  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from chat.said narration");
  }

  return chatSaidEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(listenerId),
    schemaVersion,
    type: "chat.said",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: payload.roomId,
    narration,
    segments,
    payload,
  } satisfies ChatSaidEvent);
}
