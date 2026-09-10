import {
  chatSaidPayloadSchema,
  commandAckSchema,
  commandRequestSchema,
  eventEnvelopeSchema,
  schemaVersion,
  SESSION_HELLO_EVENT,
  sessionHelloSchema,
  type CommandAck,
  type EventEnvelope,
} from "@greenwood/contracts";
import {
  applyQuestProgress,
  handleAttack,
  handleCast,
  handleDrop,
  handleExamine,
  handleHelp,
  handleInventory,
  handleJoin,
  handleLeave,
  handleLook,
  handleMove,
  handleQuests,
  handleSay,
  handleTake,
  listQuestRecords,
  isStaffCommand,
  parsePlayerCommand,
  progressQuests,
  revertDrop,
  revertTake,
  type EngineRuntime,
  type WorldState,
} from "@greenwood/game-engine";
import { describeCollegian } from "@greenwood/content";
import type { FastifyInstance } from "fastify";
import { Server, type Socket } from "socket.io";
import { CommandLog } from "../application/command-log.js";
import { persistCharacterStarterItems } from "../application/item-state.js";
import { handleStaffCommand, muteRejection } from "../application/moderation.js";
import {
  COMMAND_RATE_MAX,
  COMMAND_RATE_WINDOW_MS,
  RateLimiter,
  SAY_RATE_MAX,
  SAY_RATE_WINDOW_MS,
} from "../application/rate-limit.js";
import { claimDevCharacter, DEV_START_ROOM_ID } from "../application/session-characters.js";
import { classroomCommandFields, safeErrorMessage } from "../application/safe-log.js";
import { sessionSnapshotEvent } from "../application/session-snapshot.js";
import { parseCookie, SESSION_COOKIE } from "../auth/cookies.js";
import type { PlayIdentity } from "../auth/service.js";
import type { AuditLogRepository, ChatLogRepository } from "../persistence/types.js";

export const DEFAULT_RECONNECT_GRACE_MS = 10_000;

export type ClassroomReadModel = {
  invites: Array<{
    status: "unused" | "used" | "expired";
    role: string;
    token?: string;
    username?: string;
    characterName?: string;
  }>;
  accounts: Array<{
    username: string;
    role: string;
    status: string;
    characterName?: string;
  }>;
};

export type RealtimeOptions = {
  allowGuestPlay?: boolean;
  reconnectGraceMs?: number;
  resolveSession?: (token: string) => Promise<PlayIdentity | undefined>;
  resolveSocketTicket?: (ticket: string) => Promise<PlayIdentity | undefined>;
  persistRoom?: (characterId: string, roomId: string) => Promise<void>;
  persistItem?: {
    ensurePlacements?(
      seeds: ReadonlyArray<{ id: string; templateId: string; roomId: string }>,
    ): Promise<void>;
    claim(itemId: string, characterId: string, roomId: string): Promise<boolean>;
    release(itemId: string, characterId: string, roomId: string): Promise<boolean>;
  };
  persistProgress?: (
    characterId: string,
    input: { experience: number; level: number },
  ) => Promise<void>;
  auditLog?: AuditLogRepository;
  listClassroom?: (actorAccountId: string) => Promise<ClassroomReadModel | undefined>;
  disableAccount?: (
    actorAccountId: string,
    username: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  persistChat?: ChatLogRepository;
  persistQuest?: {
    listByCharacter(characterId: string): Promise<
      Array<{
        characterId: string;
        questId: string;
        status: "active" | "completed";
        completedObjectiveIds: string[];
        rewardGranted: boolean;
      }>
    >;
    upsert(record: {
      characterId: string;
      questId: string;
      status: "active" | "completed";
      completedObjectiveIds: string[];
      rewardGranted: boolean;
    }): Promise<void>;
  };
};

const defaultAllowedOrigins =
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000";

export function allowedOrigins(): string[] {
  const listed = (process.env.ALLOWED_ORIGINS ?? defaultAllowedOrigins)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const renderUrl = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
  if (renderUrl && !listed.includes(renderUrl)) {
    listed.push(renderUrl);
  }
  return listed;
}

export function isPrivateLanOrigin(origin: string): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== "http:") {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) {
    return true;
  }
  const parts = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!parts) {
    return false;
  }
  const first = Number.parseInt(parts[1] ?? "", 10);
  const second = Number.parseInt(parts[2] ?? "", 10);
  const third = Number.parseInt(parts[3] ?? "", 10);
  const fourth = Number.parseInt(parts[4] ?? "", 10);
  if ([first, second, third, fourth].some((octet) => Number.isNaN(octet) || octet > 255)) {
    return false;
  }
  if (first === 10 || (first === 192 && second === 168)) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  return first === 169 && second === 254;
}

export function isAllowedBrowserOrigin(
  origin: string | undefined,
  production = process.env.NODE_ENV === "production",
): boolean {
  if (!origin) {
    return true;
  }
  if (allowedOrigins().includes(origin)) {
    return true;
  }
  return !production && isPrivateLanOrigin(origin);
}

export async function attachRealtime(
  app: FastifyInstance,
  world: WorldState,
  options: RealtimeOptions = {},
): Promise<Server> {
  await app.ready();

  const allowGuestPlay = options.allowGuestPlay ?? true;
  const reconnectGraceMs = options.reconnectGraceMs ?? DEFAULT_RECONNECT_GRACE_MS;
  const sequences = new Map<string, number>();
  const sockets = new Map<string, Socket>();
  const leaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const commandLog = new CommandLog();
  const limiter = new RateLimiter();
  const mutedUntil = new Map<string, number>();
  const identities = new Map<string, PlayIdentity>();
  const bootId = crypto.randomUUID();
  const io = new Server(app.server, {
    cors: {
      origin(origin, callback) {
        if (isAllowedBrowserOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("origin not allowed"), false);
      },
      credentials: true,
    },
  });

  app.addHook("onClose", async () => {
    for (const timer of leaveTimers.values()) {
      clearTimeout(timer);
    }
    leaveTimers.clear();
    await io.close();
  });

  io.use((socket, next) => {
    void (async () => {
      try {
        const token = parseCookie(socket.handshake.headers.cookie, SESSION_COOKIE);
        if (token && options.resolveSession) {
          const identity = await options.resolveSession(token);
          if (identity) {
            socket.data.identity = identity;
            next();
            return;
          }
        }
        const ticket =
          typeof socket.handshake.auth?.ticket === "string" ? socket.handshake.auth.ticket : "";
        if (ticket && options.resolveSocketTicket) {
          const identity = await options.resolveSocketTicket(ticket);
          if (identity) {
            socket.data.identity = identity;
            next();
            return;
          }
        }
        if (!allowGuestPlay) {
          next(new Error("sign_in_required"));
          return;
        }
        next();
      } catch {
        next(new Error("sign_in_required"));
      }
    })();
  });

  io.on("connection", (socket) => {
    socket.emit(SESSION_HELLO_EVENT, sessionHelloSchema.parse({ bootId }));
    void startPlay(socket).catch((error: unknown) => {
      app.log.warn(
        { event: "socket_seat_failed", message: safeErrorMessage(error) },
        "courtyard could not seat",
      );
      noticeAndDisconnect(socket, "The courtyard could not seat you. Refresh and try again.");
    });
  });

  async function startPlay(socket: Socket): Promise<void> {
    const identity = socket.data.identity as PlayIdentity | undefined;
    const claimed = identity
      ? {
          id: identity.characterId,
          name: identity.characterName,
          roomId: identity.roomId,
        }
      : claimDevCharacter(world);
    if (!claimed) {
      noticeAndDisconnect(socket, "The courtyard cannot hold another student right now.");
      return;
    }

    const characterId = claimed.id;
    if (identity) {
      identities.set(characterId, identity);
    }
    if (identity && options.persistQuest) {
      applyQuestProgress(
        world,
        characterId,
        await options.persistQuest.listByCharacter(characterId),
      );
    }

    const present = world.characters[characterId];
    if (identity && present) {
      present.accountUsername = identity.username;
      const appearance = describeCollegian(identity.speciesId, identity.gender);
      present.lookDescription = appearance.look;
      present.examineDescription = appearance.examine;
      await persistStarterCopies(characterId, identity);
      resumeAuthenticated(socket, characterId);
      bindCommandHandlers(socket, characterId, identity);
      return;
    }

    const runtime = commandRuntime(sequences);
    const appearance = identity
      ? describeCollegian(identity.speciesId, identity.gender)
      : "speciesId" in claimed
        ? describeCollegian(claimed.speciesId, claimed.gender)
        : describeCollegian("hare", "female");
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId,
        name: claimed.name,
        roomId: "roomId" in claimed ? claimed.roomId : DEV_START_ROOM_ID,
        accountUsername: identity?.username,
        lookDescription: appearance.look,
        examineDescription: appearance.examine,
        experience: identity?.experience,
        level: identity?.level,
      },
      runtime,
    );
    if (!joined.ok) {
      noticeAndDisconnect(
        socket,
        joined.code === "character_exists"
          ? "That student is already in the Collegium. Close the other tab first."
          : joined.message,
      );
      return;
    }

    await persistStarterCopies(characterId, identity);
    if (identity && (options.persistRoom || options.persistProgress || options.persistQuest)) {
      await persistAuthenticatedProgress(characterId);
    }

    sockets.set(characterId, socket);
    app.log.info(
      {
        event: "socket_connected",
        characterId,
        accountId: identity?.accountId,
        username: identity?.username,
        role: identity?.role,
        connected: sockets.size,
      },
      "courtyard seat",
    );
    deliver(sockets, characterId, joined.events, joined.notices);
    bindCommandHandlers(socket, characterId, identity);
  }

  function resumeAuthenticated(socket: Socket, characterId: string): void {
    const previous = sockets.get(characterId);
    if (previous && previous !== socket) {
      previous.disconnect(true);
    }
    const timer = leaveTimers.get(characterId);
    if (timer) {
      clearTimeout(timer);
      leaveTimers.delete(characterId);
    }
    sockets.set(characterId, socket);
    app.log.info(
      {
        event: "socket_connected",
        characterId,
        accountId: identities.get(characterId)?.accountId,
        username: identities.get(characterId)?.username,
        role: identities.get(characterId)?.role,
        connected: sockets.size,
        resume: true,
      },
      "courtyard seat",
    );
    const runtime = commandRuntime(sequences);
    const snapshot = sessionSnapshotEvent(world, characterId, runtime);
    const look = handleLook(world, { verb: "look", characterId }, runtime);
    const events = look.ok ? [snapshot, look.event] : [snapshot];
    deliver(sockets, characterId, events, []);
  }

  async function persistStarterCopies(
    characterId: string,
    identity: PlayIdentity | undefined,
  ): Promise<void> {
    const items = identity ? options.persistItem : undefined;
    const ensurePlacements = items?.ensurePlacements?.bind(items);
    await persistCharacterStarterItems(
      world,
      characterId,
      ensurePlacements ? { ensurePlacements } : undefined,
    );
  }

  async function persistAuthenticatedProgress(characterId: string): Promise<void> {
    const character = world.characters[characterId];
    if (!character) {
      return;
    }
    if (options.persistRoom) {
      await options.persistRoom(characterId, character.roomId);
    }
    if (options.persistProgress) {
      await options.persistProgress(characterId, {
        experience: character.experience ?? 0,
        level: character.level ?? 1,
      });
    }
    if (options.persistQuest) {
      for (const record of listQuestRecords(world, characterId)) {
        await options.persistQuest.upsert(record);
      }
    }
  }

  function bindCommandHandlers(
    socket: Socket,
    characterId: string,
    identity: PlayIdentity | undefined,
  ): void {
    socket.on("command", (payload: unknown, ack?: (response: CommandAck) => void) => {
      void handleCommand(characterId, identity, payload, ack);
    });

    socket.on("disconnect", () => {
      if (sockets.get(characterId) !== socket) {
        return;
      }
      app.log.info(
        {
          event: "socket_disconnected",
          characterId,
          accountId: identity?.accountId,
          username: identity?.username,
          connected: Math.max(0, sockets.size - 1),
        },
        "courtyard leave",
      );
      const occupant = world.characters[characterId];
      const roomId = occupant?.roomId;
      if (identity && options.persistRoom && roomId) {
        void options.persistRoom(characterId, roomId);
      }
      if (identity && reconnectGraceMs > 0) {
        const timer = setTimeout(() => {
          leaveTimers.delete(characterId);
          if (sockets.get(characterId) !== socket) {
            return;
          }
          sockets.delete(characterId);
          identities.delete(characterId);
          const left = handleLeave(
            world,
            { verb: "leave", characterId },
            commandRuntime(sequences),
          );
          if (left.ok) {
            deliver(sockets, characterId, left.events, left.notices);
          }
        }, reconnectGraceMs);
        leaveTimers.set(characterId, timer);
        return;
      }
      sockets.delete(characterId);
      identities.delete(characterId);
      const left = handleLeave(world, { verb: "leave", characterId }, commandRuntime(sequences));
      if (left.ok) {
        deliver(sockets, characterId, left.events, left.notices);
      }
    });
  }

  async function handleCommand(
    characterId: string,
    identity: PlayIdentity | undefined,
    payload: unknown,
    ack: ((response: CommandAck) => void) | undefined,
  ): Promise<void> {
    const started = Date.now();
    let verb = "unknown";
    const reply = (ackFn: ((response: CommandAck) => void) | undefined, response: CommandAck) => {
      app.log.info(
        classroomCommandFields({
          commandId: response.commandId,
          verb,
          status: response.status,
          errorCode: response.errorCode,
          durationMs: Date.now() - started,
          characterId,
          accountId: identity?.accountId,
          username: identity?.username,
          connected: sockets.size,
        }),
        "command",
      );
      ackFn?.(response);
    };
    const parsed = commandRequestSchema.safeParse(payload);
    if (!parsed.success) {
      reply(
        ack,
        commandAckSchema.parse({
          commandId: "invalid",
          status: "rejected",
          errorCode: "invalid_command",
          message: "That command was not a valid request.",
          resyncRequired: false,
        }),
      );
      return;
    }

    const recorded = commandLog.get(characterId, parsed.data.commandId);
    if (recorded) {
      verb = "replay";
      deliver(sockets, characterId, recorded.events, recorded.notices);
      reply(ack, recorded.ack);
      return;
    }

    const intent = parsePlayerCommand(parsed.data.raw, characterId);
    if (intent) {
      verb = intent.verb;
    }
    if (!intent) {
      const rejection = commandAckSchema.parse({
        commandId: parsed.data.commandId,
        status: "rejected",
        errorCode: "unknown_command",
        message: `I do not recognize "${parsed.data.raw.trim()}."\n\nDid you mean:\n  help\n  quests\n  look\n  say\n  inventory\n  take\n  drop\n  examine\n  attack dummy\n  cast ember\n  north\n  south\n  east\n  west`,
        resyncRequired: false,
      });
      commandLog.set(characterId, parsed.data.commandId, {
        ack: rejection,
        events: [],
        notices: [],
      });
      reply(ack, rejection);
      return;
    }

    if (!limiter.allow(`command:${characterId}`, COMMAND_RATE_MAX, COMMAND_RATE_WINDOW_MS)) {
      app.log.warn(
        { event: "rate_limited", kind: "command", characterId, connected: sockets.size },
        "rate limited",
      );
      reply(
        ack,
        commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "rate_limited",
          message: "Please wait a moment before sending another command.",
          resyncRequired: false,
        }),
      );
      return;
    }

    if (intent.verb === "say") {
      const until = mutedUntil.get(characterId);
      if (until !== undefined && until > Date.now()) {
        const rejection = commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "forbidden",
          message: muteRejection(until, Date.now()),
          resyncRequired: false,
        });
        commandLog.set(characterId, parsed.data.commandId, {
          ack: rejection,
          events: [],
          notices: [],
        });
        reply(ack, rejection);
        return;
      }
      if (until !== undefined) {
        mutedUntil.delete(characterId);
      }
    }

    if (
      intent.verb === "say" &&
      !limiter.allow(`say:${characterId}`, SAY_RATE_MAX, SAY_RATE_WINDOW_MS)
    ) {
      app.log.warn(
        { event: "rate_limited", kind: "say", characterId, connected: sockets.size },
        "rate limited",
      );
      reply(
        ack,
        commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "rate_limited",
          message: "Please wait a moment before saying more.",
          resyncRequired: false,
        }),
      );
      return;
    }

    const runtime = commandRuntime(sequences);
    if (isStaffCommand(intent)) {
      const staff = await handleStaffCommand(intent, {
        world,
        actorId: characterId,
        identity,
        runtime,
        onlineCharacterIds: [...sockets.keys()],
        mutedUntil,
        identities,
        audit: options.auditLog,
        now: () => new Date(),
        listClassroom: identity
          ? async () => {
              if (!options.listClassroom) {
                return undefined;
              }
              return options.listClassroom(identity.accountId);
            }
          : undefined,
        disableAccount: identity
          ? async (username) => {
              if (!options.disableAccount) {
                return { ok: false as const, message: "That account could not be removed." };
              }
              return options.disableAccount(identity.accountId, username);
            }
          : undefined,
      });
      if (!staff.ok) {
        const rejection = commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: staff.code,
          message: staff.message,
          resyncRequired: false,
        });
        commandLog.set(characterId, parsed.data.commandId, {
          ack: rejection,
          events: [],
          notices: [],
        });
        reply(ack, rejection);
        return;
      }
      const delivered = deliver(sockets, characterId, staff.events, staff.notices);
      if (staff.kickCharacterId) {
        kickCharacter(staff.kickCharacterId);
      }
      const first = delivered[0];
      const last = delivered[delivered.length - 1];
      if (!first || !last) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "empty_result",
            message: "The command produced no events.",
            resyncRequired: false,
          }),
        );
        return;
      }
      const accepted = commandAckSchema.parse({
        commandId: parsed.data.commandId,
        status: "accepted",
        message: intent.verb,
        eventSequenceStart: first.sequence,
        eventSequenceEnd: last.sequence,
        resyncRequired: false,
      });
      commandLog.set(characterId, parsed.data.commandId, {
        ack: accepted,
        events: delivered,
        notices: staff.notices,
      });
      reply(ack, accepted);
      return;
    }

    await persistStarterCopies(characterId, identity);

    const result =
      intent.verb === "look"
        ? handleLook(world, intent, runtime)
        : intent.verb === "move"
          ? handleMove(world, intent, runtime)
          : intent.verb === "say"
            ? handleSay(world, intent, runtime)
            : intent.verb === "take"
              ? handleTake(world, intent, runtime)
              : intent.verb === "drop"
                ? handleDrop(world, intent, runtime)
                : intent.verb === "examine"
                  ? handleExamine(world, intent, runtime)
                  : intent.verb === "inventory"
                    ? handleInventory(world, intent, runtime)
                    : intent.verb === "help"
                      ? handleHelp(world, intent, runtime)
                      : intent.verb === "quests"
                        ? handleQuests(world, intent, runtime)
                        : intent.verb === "attack"
                          ? handleAttack(world, intent, runtime)
                          : handleCast(world, intent, runtime);

    if (!result.ok) {
      const rejection = commandAckSchema.parse({
        commandId: parsed.data.commandId,
        status: "rejected",
        errorCode: result.code,
        message: result.message,
        resyncRequired: false,
      });
      commandLog.set(characterId, parsed.data.commandId, {
        ack: rejection,
        events: [],
        notices: [],
      });
      reply(ack, rejection);
      return;
    }

    if (
      identity &&
      options.persistRoom &&
      result.ok &&
      "outcome" in result &&
      result.outcome === "defeat"
    ) {
      await options.persistRoom(characterId, result.roomId);
    }

    if (identity && options.persistItem && result.ok && "itemId" in result) {
      const persisted =
        intent.verb === "take"
          ? await options.persistItem.claim(result.itemId, characterId, result.roomId)
          : intent.verb === "drop"
            ? await options.persistItem.release(result.itemId, characterId, result.roomId)
            : true;
      if (!persisted) {
        const item = world.items?.[result.itemId];
        if (item && intent.verb === "take") {
          revertTake(item, result.roomId);
        }
        if (item && intent.verb === "drop") {
          revertDrop(item, characterId);
        }
        const rejection = commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "already_taken",
          message:
            intent.verb === "drop"
              ? "You are no longer carrying that."
              : "The item is no longer here.",
          resyncRequired: false,
        });
        commandLog.set(characterId, parsed.data.commandId, {
          ack: rejection,
          events: [],
          notices: [],
        });
        reply(ack, rejection);
        return;
      }
    }

    const extra =
      intent.verb === "look" ||
      intent.verb === "say" ||
      intent.verb === "take" ||
      intent.verb === "move"
        ? progressQuests(world, { characterId, kind: intent.verb }, runtime)
        : [];
    if (intent.verb === "say" && options.persistChat && result.ok && "events" in result) {
      const payload = chatSaidPayloadSchema.safeParse(result.events[0]?.payload);
      const speaker = world.characters[characterId];
      if (payload.success && speaker) {
        try {
          await options.persistChat.append({
            at: runtime.now(),
            characterId,
            accountId: identity?.accountId,
            username: identity?.username,
            characterName: speaker.name,
            roomId: payload.data.roomId,
            text: payload.data.text,
          });
        } catch (error) {
          app.log.warn(
            { event: "chat_log_failed", message: safeErrorMessage(error) },
            "chat log",
          );
        }
      }
    }

    if (
      identity &&
      (intent.verb === "look" ||
        intent.verb === "say" ||
        intent.verb === "take" ||
        intent.verb === "move" ||
        intent.verb === "attack" ||
        intent.verb === "cast")
    ) {
      await persistAuthenticatedProgress(characterId);
    }

    const events = [...("events" in result ? result.events : [result.event]), ...extra];
    const notices = "notices" in result ? result.notices : [];
    const delivered = deliver(sockets, characterId, events, notices);
    const first = delivered[0];
    const last = delivered[delivered.length - 1];
    if (!first || !last) {
      reply(
        ack,
        commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "empty_result",
          message: "The command produced no events.",
          resyncRequired: false,
        }),
      );
      return;
    }

    const accepted = commandAckSchema.parse({
      commandId: parsed.data.commandId,
      status: "accepted",
      message: intent.verb === "move" ? intent.direction : intent.verb,
      eventSequenceStart: first.sequence,
      eventSequenceEnd: last.sequence,
      resyncRequired: false,
    });
    commandLog.set(characterId, parsed.data.commandId, {
      ack: accepted,
      events: delivered,
      notices,
    });
    reply(ack, accepted);
  }

  function kickCharacter(targetId: string): void {
    const timer = leaveTimers.get(targetId);
    if (timer) {
      clearTimeout(timer);
      leaveTimers.delete(targetId);
    }
    const targetSocket = sockets.get(targetId);
    sockets.delete(targetId);
    identities.delete(targetId);
    const left = handleLeave(
      world,
      { verb: "leave", characterId: targetId },
      commandRuntime(sequences),
    );
    if (left.ok) {
      deliver(sockets, targetId, left.events, left.notices);
    }
    targetSocket?.disconnect(true);
  }

  return io;
}

function noticeAndDisconnect(socket: Socket, narration: string): void {
  socket.emit(
    "event",
    eventEnvelopeSchema.parse({
      eventId: crypto.randomUUID(),
      sequence: 1,
      schemaVersion,
      type: "system.notice",
      occurredAt: new Date().toISOString(),
      audience: "character",
      narration,
      payload: {},
    }),
  );
  socket.disconnect(true);
}

function deliver(
  sockets: Map<string, Socket>,
  actorId: string,
  events: readonly EventEnvelope[],
  notices: readonly { characterId: string; event: EventEnvelope }[],
): EventEnvelope[] {
  const mine = events.map((event) => eventEnvelopeSchema.parse(event));
  for (const event of mine) {
    sockets.get(actorId)?.emit("event", event);
  }
  for (const notice of notices) {
    sockets.get(notice.characterId)?.emit("event", eventEnvelopeSchema.parse(notice.event));
  }
  return mine;
}

function commandRuntime(sequences: Map<string, number>): EngineRuntime {
  return {
    now: () => new Date(),
    nextEventId: () => crypto.randomUUID(),
    nextSequence: (id) => {
      const next = (sequences.get(id) ?? 0) + 1;
      sequences.set(id, next);
      return next;
    },
    random: () => Math.random(),
  };
}
