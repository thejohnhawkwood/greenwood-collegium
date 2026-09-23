import {
  eventEnvelopeSchema,
  renderClassicSegments,
  schemaVersion,
  type EventEnvelope,
  type RoomSnapshotEvent,
} from "@greenwood/contracts";
import { closeConversationIfNpcGone } from "./arrival-guide.js";
import { rejectIfInCombat } from "./combat-state.js";
import { questPrerequisitesMet } from "./east-watch.js";
import { handleLook } from "./look.js";
import { namesMatch } from "./names.js";
import { charactersInRoom } from "./occupants.js";
import { enteredNotices, leftNotices, type OccupantNotice } from "./presence-events.js";
import type {
  Character,
  EngineRuntime,
  QuestTemplate,
  Room,
  RoomFixture,
  WorldState,
} from "./state.js";

export const NOTICEBOARD_ID = "object-noticeboard";

export type NoticePost = {
  questId: string;
  title: string;
  status: "offered" | "active";
  line: string;
  place: string;
  roomId: string;
  who?: string;
  command?: string;
};

export type SeekSuccess = {
  ok: true;
  events: Array<RoomSnapshotEvent | EventEnvelope>;
  notices: OccupantNotice[];
};

export type SeekFailure = {
  ok: false;
  code:
    | "character_not_found"
    | "room_not_found"
    | "in_combat"
    | "not_at_board"
    | "unknown_post"
    | "ambiguous_post"
    | "already_there";
  message: string;
};

export function noticeboardPosts(world: WorldState, character: Character): NoticePost[] {
  const posts: NoticePost[] = [];
  for (const template of Object.values(world.questTemplates ?? {})) {
    const progress = world.quests?.[character.id]?.[template.id];
    if (progress?.status === "completed") continue;
    const offered = !progress;
    if (offered && !template.giverNpcId) continue;
    if (offered && !questPrerequisitesMet(world, character, template.requiresQuestIds)) continue;
    const spot = destinationFor(world, template, progress?.completedObjectiveIds ?? []);
    if (!spot) continue;
    if (offered && !spot.who) continue;
    const here = spot.roomId === character.roomId;
    posts.push({
      questId: template.id,
      title: template.title,
      status: offered ? "offered" : "active",
      line: offered
        ? boardLine(template.reminderNarration)
        : currentStep(template, progress?.completedObjectiveIds ?? []),
      place: spot.place,
      roomId: spot.roomId,
      ...(spot.who ? { who: spot.who } : {}),
      ...(here ? {} : { command: `seek ${spot.who ?? spot.place}` }),
    });
  }
  return posts.sort((left, right) => {
    if (left.status !== right.status) return left.status === "active" ? -1 : 1;
    return left.title.localeCompare(right.title);
  });
}

export function handleSeek(
  world: WorldState,
  intent: { verb: "seek"; characterId: string; target: string },
  runtime: EngineRuntime,
): SeekSuccess | SeekFailure {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  const origin = world.rooms[character.roomId];
  if (!origin) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }
  const blocked = rejectIfInCombat(world, character.id);
  if (blocked) return blocked;
  if (!origin.fixtures.some((fixture) => fixture.id === NOTICEBOARD_ID)) {
    return {
      ok: false,
      code: "not_at_board",
      message: "Read the noticeboard in Lantern Court, then name someone on it.",
    };
  }
  if (!intent.target.trim()) {
    return {
      ok: false,
      code: "unknown_post",
      message: "Seek whom? Name a person or place on the noticeboard.",
    };
  }
  const posts = noticeboardPosts(world, character).filter((post) =>
    postMatches(post, intent.target),
  );
  const roomIds = [...new Set(posts.map((post) => post.roomId))];
  if (roomIds.length === 0) {
    return {
      ok: false,
      code: "unknown_post",
      message: "That name is not on the noticeboard.",
    };
  }
  if (roomIds.length > 1) {
    return {
      ok: false,
      code: "ambiguous_post",
      message: `Which place did you mean: ${posts.map((post) => post.place).join(", ")}?`,
    };
  }
  const post = posts[0]!;
  const destination = world.rooms[post.roomId];
  if (!destination) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${post.roomId}" is missing.`,
    };
  }
  if (destination.id === origin.id) {
    return {
      ok: false,
      code: "already_there",
      message: `You are already in ${destination.title}.`,
    };
  }
  const leavers = charactersInRoom(world, origin.id, character.id);
  character.roomId = destination.id;
  if (!character.discoveredRoomIds.includes(destination.id)) {
    character.discoveredRoomIds.push(destination.id);
  }
  closeConversationIfNpcGone(world, character);
  const arrivals = charactersInRoom(world, destination.id, character.id);
  const narration = post.who
    ? `The noticeboard sends you to ${destination.title} to find ${post.who}.`
    : `The noticeboard sends you to ${destination.title}.`;
  const segments = post.who
    ? [
        { kind: "system" as const, text: "The noticeboard sends you to " },
        { kind: "location" as const, id: destination.id, text: destination.title },
        { kind: "text" as const, text: " to find " },
        { kind: "actor" as const, entityKind: "npc" as const, text: post.who },
        { kind: "text" as const, text: "." },
      ]
    : [
        { kind: "system" as const, text: "The noticeboard sends you to " },
        { kind: "location" as const, id: destination.id, text: destination.title },
        { kind: "text" as const, text: "." },
      ];
  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from seek narration");
  }
  const notice = eventEnvelopeSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "system.notice",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: destination.id,
    narration,
    segments,
    payload: { roomId: destination.id, title: destination.title, method: "seek" },
  });
  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (!look.ok) {
    return { ok: false, code: "room_not_found", message: look.message };
  }
  return {
    ok: true,
    events: [notice, look.event],
    notices: [
      ...leftNotices(leavers, character, origin.id, runtime),
      ...enteredNotices(arrivals, character, destination.id, runtime),
    ],
  };
}

function destinationFor(
  world: WorldState,
  template: QuestTemplate,
  done: readonly string[],
): { roomId: string; place: string; who?: string } | undefined {
  if (template.giverNpcId) {
    const home = npcHome(world, template.giverNpcId);
    if (home) return home;
  }
  const open = template.objectives.find((objective) => !done.includes(objective.id));
  if (open?.roomId) {
    const room = world.rooms[open.roomId];
    if (room) return { roomId: room.id, place: room.title };
  }
  if (open?.targetId) {
    return npcHome(world, open.targetId);
  }
  return undefined;
}

function npcHome(
  world: WorldState,
  npcId: string,
): { roomId: string; place: string; who: string } | undefined {
  for (const room of Object.values(world.rooms)) {
    const fixture = room.fixtures.find(
      (entry): entry is RoomFixture => entry.id === npcId && entry.kind === "npc",
    );
    if (fixture) return { roomId: room.id, place: room.title, who: fixture.name };
  }
  return undefined;
}

function currentStep(template: QuestTemplate, done: readonly string[]): string {
  const open = template.objectives.find((objective) => !done.includes(objective.id));
  return boardLine(open?.label ?? template.reminderNarration);
}

function boardLine(raw: string): string {
  const clean = raw.replace(/"/gu, "").trim();
  const sentence = clean.split(/(?<=\.)\s/u)[0] ?? clean;
  if (!sentence) return "The board names this work.";
  return sentence.length > 180 ? `${sentence.slice(0, 177)}...` : sentence;
}

function postMatches(post: NoticePost, target: string): boolean {
  return (
    namesMatch(post.title, post.questId, target) ||
    namesMatch(post.place, post.roomId, target) ||
    (post.who ? namesMatch(post.who, post.questId, target) : false)
  );
}

export function roomHasNoticeboard(room: Room | undefined): boolean {
  return Boolean(room?.fixtures.some((fixture) => fixture.id === NOTICEBOARD_ID));
}
