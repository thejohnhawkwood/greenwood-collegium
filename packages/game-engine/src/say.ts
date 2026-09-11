import {
  chatSaidEventSchema,
  formatChatSaidText,
  renderClassicSegments,
  schemaVersion,
  type ChatSaidEvent,
  type EventEnvelope,
} from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { conversationChoice, formatDialogueNode, treeNode } from "./conversation.js";
import { charactersInRoom } from "./occupants.js";
import { sanitizeSpeech, SAY_MAX_LENGTH } from "./speech.js";
import type { EngineRuntime, SayIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type ChatNotice = {
  characterId: string;
  event: ChatSaidEvent;
};

export type SaySuccess = {
  ok: true;
  events: Array<ChatSaidEvent | EventEnvelope>;
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

  const reply = replyToOpenConversation(world, character.id, intent.text, runtime);
  if (reply) {
    return { ok: true, events: [reply], notices: [] };
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
          {
            kind: "actor" as const,
            entityKind: "player" as const,
            id: payload.speakerId,
            text: payload.speakerName,
          },
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

function replyToOpenConversation(
  world: WorldState,
  characterId: string,
  spoken: string,
  runtime: EngineRuntime,
): EventEnvelope | undefined {
  const character = world.characters[characterId];
  const open = character?.openConversation;
  if (!character || !open) {
    return undefined;
  }
  const npc = fixturesVisibleTo(world, character).find((fixture) => fixture.id === open.npcId);
  const tree = npc?.dialogueTree;
  const current = tree ? treeNode(tree, open.nodeId) : undefined;
  if (!npc || !tree || !current) {
    character.openConversation = undefined;
    return undefined;
  }
  const choice = conversationChoice(current, spoken);
  if (!choice) {
    return undefined;
  }
  if (!choice.next) {
    character.openConversation = undefined;
    return systemNotice(character.id, `${npc.name}\n\nVery well.`, runtime);
  }
  const next = treeNode(tree, choice.next);
  if (!next) {
    character.openConversation = undefined;
    return systemNotice(character.id, `${npc.name}\n\nThat is all for now.`, runtime);
  }
  character.openConversation = { npcId: npc.id, nodeId: choice.next };
  return systemNotice(character.id, formatDialogueNode(npc.name, next), runtime);
}
