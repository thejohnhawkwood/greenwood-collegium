import {
  commandAckSchema,
  PLAY_STATE_EVENT,
  commandRequestSchema,
  eventEnvelopeSchema,
  resolveVisualGender,
  schemaVersion,
  SESSION_HELLO_EVENT,
  sessionHelloSchema,
  type CommandAck,
  type EventEnvelope,
} from "@greenwood/contracts";
import {
  applyQuestProgress,
  createPlayState,
  activeEncounter,
  encounterMembers,
  handleAttack,
  handleCombatExpire,
  handleDefend,
  handleFlee,
  handleBye,
  handleDrink,
  handleEat,
  tickCharacterVitals,
  handleCast,
  handleDrop,
  handleExamine,
  handleTalk,
  handleHelp,
  handleInventory,
  handleJoin,
  handleLeave,
  handleLook,
  handleMap,
  handleMove,
  handleTravel,
  handleSeek,
  handleQuests,
  handleSay,
  handleStats,
  handleSpells,
  handleEquip,
  handleUnequip,
  restoreEquipment,
  handleInk,
  handleTake,
  handleDuel,
  isSchoolId,
  listQuestRecords,
  isStaffCommand,
  parsePlayerCommand,
  progressQuests,
  revertDrop,
  revertTake,
  type EngineRuntime,
  alderCallNarration,
  defenseClosedNarration,
  minutesLeft,
  settleDefense,
  type PendingPrimerChoices,
  type PrimerChoiceCard,
  type SpellTag,
  type WorldState,
} from "@greenwood/game-engine";
import { describeCollegian } from "@greenwood/content";
import type { FastifyInstance } from "fastify";
import { Server, type Socket } from "socket.io";
import { CommandLog } from "../application/command-log.js";
import { persistCharacterStarterItems, persistPersonalLoot } from "../application/item-state.js";
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
import type { AuditLogRepository } from "../persistence/types.js";
import type { ClassroomService } from "../application/classroom.js";
import { createOperationQueue, type RunExclusive } from "../application/operation-queue.js";

export const DEFAULT_RECONNECT_GRACE_MS = 10_000;

export type InPlaySeat = {
  characterId: string;
  accountId?: string;
  roomId?: string;
  roomTitle?: string;
};

export function echoInPlay(
  sockets: Iterable<[string, { connected: boolean }]>,
  identities: Map<string, { accountId: string }>,
  world: {
    characters: Record<string, { roomId?: string } | undefined>;
    rooms: Record<string, { title?: string } | undefined>;
  },
): InPlaySeat[] {
  const seats: InPlaySeat[] = [];
  for (const [characterId, socket] of sockets) {
    if (!socket.connected) continue;
    const occupant = world.characters[characterId];
    const roomId = occupant?.roomId;
    seats.push({
      characterId,
      accountId: identities.get(characterId)?.accountId,
      roomId,
      roomTitle: roomId ? (world.rooms[roomId]?.title ?? roomId) : undefined,
    });
  }
  return seats;
}

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
  classroom?: ClassroomService;
  runExclusive?: RunExclusive;
  allowGuestPlay?: boolean;
  reconnectGraceMs?: number;
  resolveSession?: (token: string) => Promise<PlayIdentity | undefined>;
  resolveSocketTicket?: (ticket: string) => Promise<PlayIdentity | undefined>;
  persistRoom?: (characterId: string, roomId: string) => Promise<void>;
  persistDiscovery?: (characterId: string, roomIds: readonly string[]) => Promise<void>;
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
  persistSchool?: (characterId: string, schoolId: string | undefined) => Promise<void>;
  persistDefeatedSpawns?: (characterId: string, spawnIds: readonly string[]) => Promise<void>;
  persistEquipment?: (
    characterId: string,
    equipment: NonNullable<PlayIdentity["equipment"]>,
  ) => Promise<void>;
  persistPrimer?: (
    characterId: string,
    input: {
      knownSpells: NonNullable<PlayIdentity["knownSpells"]>;
      pendingPrimerChoices?: PlayIdentity["pendingPrimerChoices"];
      primerAwardedLevels: number[];
    },
  ) => Promise<void>;
  auditLog?: AuditLogRepository;
  /** H3. One row for the process-wide defense phase. */
  persistDefense?: (record: {
    id: string;
    phase: "quiet" | "called" | "fighting" | "closed";
    endsAt?: Date;
    startedByUsername?: string;
  }) => Promise<void>;
  listClassroom?: (actorAccountId: string) => Promise<ClassroomReadModel | undefined>;
  bindInPlay?: (listInPlay: () => InPlaySeat[]) => void;
  disableAccount?: (
    actorAccountId: string,
    username: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  persistQuest?: {
    listByCharacter(characterId: string): Promise<
      Array<{
        characterId: string;
        questId: string;
        status: "active" | "completed";
        completedObjectiveIds: string[];
        rewardGranted: boolean;
        outcome?: string;
      }>
    >;
    upsert(record: {
      characterId: string;
      questId: string;
      status: "active" | "completed";
      completedObjectiveIds: string[];
      rewardGranted: boolean;
      outcome?: string;
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
  const runExclusive = options.runExclusive ?? createOperationQueue();
  const reconnectGraceMs = options.reconnectGraceMs ?? DEFAULT_RECONNECT_GRACE_MS;
  const sequences = new Map<string, number>();
  const sockets = new Map<string, Socket>();
  const leaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const combatLockTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const commandLog = new CommandLog();
  const limiter = new RateLimiter();
  const mutedUntil = new Map<string, number>();
  const identities = new Map<string, PlayIdentity>();
  let defenseTimer: ReturnType<typeof setTimeout> | undefined;
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
  const unsubscribe = options.classroom?.subscribe((change) => {
    for (const [characterId, identity] of identities) {
      if (!change.accountIds.includes(identity.accountId)) continue;
      sockets.get(characterId)?.emit("moderation-changed", {
        message: change.message,
        refreshSession: change.refreshSession ?? false,
      });
      if (change.disconnect) kickCharacter(characterId);
    }
    if (change.characterIds) {
      for (const [id, item] of Object.entries(world.items ?? {})) {
        if (
          change.characterIds.includes(item.holderCharacterId ?? "") ||
          change.characterIds.includes(item.availableToCharacterId ?? "")
        )
          delete world.items?.[id];
      }
      for (const id of change.characterIds) delete world.quests?.[id];
    }
  });

  const vitalTimer = setInterval(() => {
    void runExclusive(async () => {
      const changed = tickCharacterVitals(world);
      for (const id of changed) {
        const snapshot = createPlayState(world, id, { presentIds: [...sockets.keys()] });
        if (snapshot) sockets.get(id)?.emit(PLAY_STATE_EVENT, snapshot);
      }
    }).catch(() => undefined);
  }, 10_000);
  vitalTimer.unref();

  app.addHook("onClose", async () => {
    clearInterval(vitalTimer);
    unsubscribe?.();
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
    void runExclusive(() => startPlay(socket)).catch((error: unknown) => {
      app.log.warn(
        { event: "socket_seat_failed", message: safeErrorMessage(error) },
        "courtyard could not seat",
      );
      noticeAndDisconnect(socket, "The courtyard could not seat you. Refresh and try again.");
    });
  });

  async function startPlay(socket: Socket): Promise<void> {
    const identity = socket.data.identity as PlayIdentity | undefined;
    if (!socket.connected) return;
    if (identity && options.classroom) {
      const denied = await options.classroom.access(identity);
      if (denied) {
        noticeAndDisconnect(socket, denied);
        return;
      }
    }
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
      present.speciesId = identity.speciesId;
      present.gender = resolveVisualGender(identity.gender);
      present.appearance = identity.appearance;
      present.discoveredRoomIds = [
        ...new Set([...(identity.discoveredRoomIds ?? present.discoveredRoomIds), present.roomId]),
      ];
      if (identity.schoolId && isSchoolId(identity.schoolId)) {
        present.schoolId = identity.schoolId;
      }
      present.defeatedSpawnIds = [
        ...new Set([...(present.defeatedSpawnIds ?? []), ...(identity.defeatedSpawnIds ?? [])]),
      ];
      if (identity.knownSpells?.length) {
        present.knownSpells = identity.knownSpells.map((leaf) => ({ ...leaf }));
      }
      if (identity.pendingPrimerChoices) {
        present.pendingPrimerChoices = toPendingPrimer(identity.pendingPrimerChoices);
      }
      if (identity.primerAwardedLevels?.length) {
        present.primerAwardedLevels = [...identity.primerAwardedLevels];
      }
      await persistStarterCopies(characterId, identity);
      restoreEquipment(world, present, identity.equipment ?? {});
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
        speciesId: identity?.speciesId ?? ("speciesId" in claimed ? claimed.speciesId : undefined),
        gender: resolveVisualGender(
          identity?.gender ?? ("gender" in claimed ? claimed.gender : undefined),
        ),
        appearance: identity?.appearance,
        discoveredRoomIds: identity?.discoveredRoomIds,
        defeatedSpawnIds: identity?.defeatedSpawnIds,
        knownSpells: identity?.knownSpells,
        pendingPrimerChoices: toPendingPrimer(identity?.pendingPrimerChoices),
        primerAwardedLevels: identity?.primerAwardedLevels,
        schoolId:
          identity?.schoolId && isSchoolId(identity.schoolId) ? identity.schoolId : undefined,
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
    const arrived = world.characters[characterId];
    if (identity && arrived) {
      restoreEquipment(world, arrived, identity.equipment ?? {});
    }
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
    // H3. Somebody arriving mid-defense is exactly who needs to hear Alder.
    const greeting = defenseGreeting();
    deliverPlay(characterId, [...joined.events, ...greeting(characterId)], joined.notices);
    bindCommandHandlers(socket, characterId, identity);
  }

  /** Alder's call again, for a Collegian who joined or reconnected while the yard is held. */
  function defenseGreeting(): (characterId: string) => EventEnvelope[] {
    settleDefense(world, new Date());
    const running = world.defense?.phase === "fighting" ? world.defense : undefined;
    if (!running) {
      return () => [];
    }
    const minutes = Math.max(1, minutesLeft(running, new Date()));
    const line = alderCallNarration(minutes);
    return (characterId) => [systemNoticeFor(characterId, line, commandRuntime(sequences))];
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
    deliverPlay(characterId, [...events, ...defenseGreeting()(characterId)], []);
    armCombatLock(characterId, identities.get(characterId));
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
    if (options.persistDiscovery) {
      await options.persistDiscovery(characterId, character.discoveredRoomIds);
    }
    if (options.persistProgress) {
      await options.persistProgress(characterId, {
        experience: character.experience ?? 0,
        level: character.level ?? 1,
      });
    }
    if (options.persistSchool) {
      await options.persistSchool(characterId, character.schoolId);
    }
    if (options.persistDefeatedSpawns) {
      await options.persistDefeatedSpawns(characterId, character.defeatedSpawnIds ?? []);
    }
    if (options.persistEquipment) {
      await options.persistEquipment(characterId, { ...(character.equipment ?? {}) });
    }
    if (options.persistPrimer) {
      await options.persistPrimer(characterId, {
        knownSpells: (character.knownSpells ?? []).map((leaf) => ({ ...leaf })),
        pendingPrimerChoices: character.pendingPrimerChoices
          ? {
              ...character.pendingPrimerChoices,
              options: character.pendingPrimerChoices.options.map((card) => ({ ...card })),
            }
          : undefined,
        primerAwardedLevels: [...(character.primerAwardedLevels ?? [])],
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
      void runExclusive(async () => {
        if (!socket.connected || sockets.get(characterId) !== socket) return;
        await handleCommand(characterId, identity, payload, ack);
      }).catch(() => {
        app.log.error({ event: "command_failed" }, "command could not be completed");
        const request = commandRequestSchema.safeParse(payload);
        ack?.({
          commandId: request.success ? request.data.commandId : "invalid",
          status: "rejected",
          errorCode: "unavailable",
          message: "The command could not be completed. Please try again.",
          resyncRequired: false,
        });
      });
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
      if (identity && options.persistDiscovery && occupant) {
        void options.persistDiscovery(characterId, occupant.discoveredRoomIds);
      }
      if (identity && reconnectGraceMs > 0) {
        const timer = setTimeout(() => {
          leaveTimers.delete(characterId);
          if (sockets.get(characterId) !== socket) {
            return;
          }
          sockets.delete(characterId);
          identities.delete(characterId);
          clearCombatLock(characterId);
          const left = handleLeave(
            world,
            { verb: "leave", characterId },
            commandRuntime(sequences),
          );
          if (left.ok) {
            deliverPlay(characterId, left.events, left.notices);
          }
        }, reconnectGraceMs);
        leaveTimers.set(characterId, timer);
        return;
      }
      sockets.delete(characterId);
      identities.delete(characterId);
      clearCombatLock(characterId);
      const left = handleLeave(world, { verb: "leave", characterId }, commandRuntime(sequences));
      if (left.ok) {
        deliverPlay(characterId, left.events, left.notices);
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

    if (identity && options.classroom) {
      const denied = await options.classroom.access(identity);
      if (denied) {
        reply(ack, {
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "forbidden",
          message: denied,
          resyncRequired: false,
        });
        kickCharacter(characterId);
        return;
      }
    }
    const recorded = commandLog.get(characterId, parsed.data.commandId);
    if (recorded) {
      verb = "replay";
      deliverPlay(characterId, recorded.events, []);
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
      if (identity && options.classroom) {
        const denied = await options.classroom.access(identity, true);
        if (denied) {
          reply(ack, {
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "forbidden",
            message: denied,
            resyncRequired: false,
          });
          return;
        }
      }
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
        persistMute:
          identity && options.classroom
            ? (accountId, minutes) =>
                options.classroom!.moderate(identity.accountId, {
                  action: "mute",
                  accountId,
                  minutes,
                  reason: "Classroom command",
                })
            : undefined,
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
        persistDefense: async (defense) => {
          await options.persistDefense?.({
            id: defense.id,
            phase: defense.phase,
            endsAt: defense.endsAt ? new Date(defense.endsAt) : undefined,
            startedByUsername: defense.startedByUsername,
          });
          armDefenseClock();
        },
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
      const delivered = deliverPlay(characterId, staff.events, staff.notices);
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

    const previousEncounterId = activeEncounter(world, characterId)?.id;
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
                  : intent.verb === "talk"
                    ? handleTalk(world, intent, runtime)
                    : intent.verb === "inventory"
                      ? handleInventory(world, intent, runtime)
                      : intent.verb === "map"
                        ? handleMap(world, intent, runtime)
                        : intent.verb === "help"
                          ? handleHelp(world, intent, runtime)
                          : intent.verb === "quests"
                            ? handleQuests(world, intent, runtime)
                            : intent.verb === "stats"
                              ? handleStats(world, intent, runtime)
                              : intent.verb === "spells"
                                ? handleSpells(world, intent, runtime)
                                : intent.verb === "unequip"
                                  ? handleUnequip(world, intent, runtime)
                                  : intent.verb === "equip"
                                    ? handleEquip(world, intent, runtime)
                                    : intent.verb === "ink"
                                      ? handleInk(world, intent, runtime)
                                      : intent.verb === "attack"
                                        ? handleAttack(world, intent, runtime)
                                        : intent.verb === "defend"
                                          ? handleDefend(world, intent, runtime)
                                          : intent.verb === "flee"
                                            ? handleFlee(world, intent, runtime)
                                            : intent.verb === "travel"
                                              ? handleTravel(world, intent, runtime)
                                              : intent.verb === "seek"
                                                ? handleSeek(world, intent, runtime)
                                                : intent.verb === "bye"
                                                  ? handleBye(world, intent, runtime)
                                                  : intent.verb === "drink"
                                                    ? handleDrink(world, intent, runtime)
                                                    : intent.verb === "eat"
                                                      ? handleEat(world, intent, runtime)
                                                      : intent.verb === "duel"
                                                        ? handleDuel(world, intent, runtime)
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
      result.outcome === "defeat" &&
      "roomId" in result &&
      typeof result.roomId === "string"
    ) {
      await options.persistRoom(characterId, result.roomId);
    }

    if (
      identity &&
      options.persistItem &&
      result.ok &&
      "outcome" in result &&
      result.outcome === "victory"
    ) {
      await persistPersonalLoot(world, options.persistItem);
    }

    if (
      identity &&
      options.persistItem &&
      result.ok &&
      "itemId" in result &&
      typeof result.itemId === "string" &&
      "roomId" in result &&
      typeof result.roomId === "string" &&
      (!("persist" in result) || result.persist !== false)
    ) {
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

    const resultEvents = "events" in result ? result.events : [result.event];
    if (identity && options.classroom && intent.verb === "say") {
      const speech = resultEvents.find((event) => event.type === "chat.said");
      if (speech) {
        const inserted = await options.classroom.recordSpeech(
          identity,
          parsed.data.commandId,
          speech,
        );
        if (!inserted) {
          reply(ack, {
            commandId: parsed.data.commandId,
            status: "accepted",
            message: "Speech already recorded.",
            resyncRequired: false,
          });
          return;
        }
      }
    }

    const extra =
      intent.verb === "look" ||
      (intent.verb === "say" && resultEvents.some((event) => event.type === "chat.said")) ||
      intent.verb === "take" ||
      intent.verb === "move" ||
      intent.verb === "equip" ||
      intent.verb === "examine"
        ? progressQuests(
            world,
            {
              characterId,
              kind: intent.verb,
              targetId:
                "targetId" in result && typeof result.targetId === "string"
                  ? result.targetId
                  : undefined,
            },
            runtime,
          )
        : intent.verb === "travel"
          ? [
              ...progressQuests(world, { characterId, kind: "look" }, runtime),
              ...progressQuests(world, { characterId, kind: "move" }, runtime),
            ]
          : intent.verb === "seek"
            ? [
                ...progressQuests(world, { characterId, kind: "look" }, runtime),
                ...progressQuests(world, { characterId, kind: "move" }, runtime),
              ]
            : [];
    if (
      identity &&
      (intent.verb === "look" ||
        intent.verb === "say" ||
        intent.verb === "take" ||
        intent.verb === "drop" ||
        intent.verb === "move" ||
        intent.verb === "examine" ||
        intent.verb === "talk" ||
        intent.verb === "equip" ||
        intent.verb === "unequip" ||
        intent.verb === "ink" ||
        intent.verb === "attack" ||
        intent.verb === "cast" ||
        intent.verb === "defend" ||
        intent.verb === "flee" ||
        intent.verb === "travel" ||
        intent.verb === "seek" ||
        intent.verb === "duel")
    ) {
      await persistAuthenticatedProgress(characterId);
      await persistPersonalLoot(world, options.persistItem);
    }

    const events = [...resultEvents, ...extra];
    const notices = "notices" in result ? result.notices : [];
    const delivered = deliverPlay(characterId, events, notices);
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
    if (
      intent.verb === "attack" ||
      intent.verb === "cast" ||
      intent.verb === "defend" ||
      intent.verb === "flee"
    ) {
      rearmPartyLocks(characterId, previousEncounterId);
    }
  }

  /**
   * H3. One timer for the whole college. When the clock runs out, Flint calls the yard
   * closed in every transcript and the porters finish the gates.
   */
  function armDefenseClock(): void {
    if (defenseTimer) {
      clearTimeout(defenseTimer);
      defenseTimer = undefined;
    }
    const endsAt = world.defense?.endsAt;
    if (world.defense?.phase !== "fighting" || !endsAt) {
      return;
    }
    const wait = Math.max(250, new Date(endsAt).getTime() - Date.now());
    defenseTimer = setTimeout(() => {
      defenseTimer = undefined;
      void runExclusive(async () => {
        const before = world.defense?.phase;
        settleDefense(world, new Date());
        if (before === "fighting" && world.defense?.phase === "closed") {
          await options.persistDefense?.({
            id: world.defense.id,
            phase: "closed",
            startedByUsername: world.defense.startedByUsername,
          });
          const runtime = commandRuntime(sequences);
          const line = defenseClosedNarration();
          for (const id of [...sockets.keys()]) {
            deliverPlay(id, [systemNoticeFor(id, line, runtime)], []);
          }
        }
      }).catch(() => {
        app.log.error({ event: "defense_close_failed" }, "defense could not close");
      });
    }, wait);
  }

  function kickCharacter(targetId: string): void {
    clearCombatLock(targetId);
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
      deliverPlay(targetId, left.events, left.notices);
    }
    targetSocket?.disconnect(true);
  }

  options.bindInPlay?.(() => echoInPlay(sockets, identities, world));
  return io;

  function clearCombatLock(characterId: string): void {
    const timer = combatLockTimers.get(characterId);
    if (timer) {
      clearTimeout(timer);
      combatLockTimers.delete(characterId);
    }
  }

  function rearmPartyLocks(actorId: string, previousEncounterId?: string): void {
    const current = activeEncounter(world, actorId);
    if (current) {
      for (const id of encounterMembers(current)) {
        armCombatLock(id, identities.get(id));
      }
      return;
    }
    clearCombatLock(actorId);
    const leftover = previousEncounterId ? world.encounters?.[previousEncounterId] : undefined;
    if (!leftover || leftover.status === "closed") {
      return;
    }
    for (const id of encounterMembers(leftover)) {
      armCombatLock(id, identities.get(id));
    }
  }

  function armCombatLock(characterId: string, identity: PlayIdentity | undefined): void {
    clearCombatLock(characterId);
    const encounter = activeEncounter(world, characterId);
    if (!encounter) {
      return;
    }
    const wait = Math.max(0, Date.parse(encounter.lockDeadlineAt) - Date.now());
    combatLockTimers.set(
      characterId,
      setTimeout(() => {
        void runExclusive(async () => {
          combatLockTimers.delete(characterId);
          const previousEncounterId = activeEncounter(world, characterId)?.id;
          const result = handleCombatExpire(
            world,
            { verb: "combat-expire", characterId },
            commandRuntime(sequences),
          );
          if (!result.ok) {
            return;
          }
          if (identity && result.outcome === "defeat" && options.persistRoom) {
            await options.persistRoom(characterId, result.roomId);
          }
          if (identity) {
            await persistAuthenticatedProgress(characterId);
          }
          deliverPlay(characterId, result.events, result.notices);
          rearmPartyLocks(characterId, previousEncounterId);
        }).catch(() => {
          app.log.error({ event: "combat_lock_failed" }, "combat lock could not complete");
        });
      }, wait),
    );
  }

  function deliverPlay(
    actorId: string,
    events: readonly EventEnvelope[],
    notices: readonly { characterId: string; event: EventEnvelope }[],
  ): EventEnvelope[] {
    const delivered = deliver(sockets, actorId, events, notices);
    // Socket.IO preserves order. Replace the entire view after the durable mutation;
    // this read model neither consumes a game sequence nor repeats narration.
    const recipients = new Set([actorId, ...notices.map((notice) => notice.characterId)]);
    for (const id of recipients) {
      const snapshot = createPlayState(world, id, { presentIds: [...sockets.keys()] });
      if (snapshot) sockets.get(id)?.emit(PLAY_STATE_EVENT, snapshot);
    }
    return delivered;
  }
}

/** H3. One plain line to one Collegian, in the sequence they are already reading. */
function systemNoticeFor(
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

const SPELL_TAGS = new Set<SpellTag>(["strike", "control", "ward", "gift"]);

function toPendingPrimer(
  pending: PlayIdentity["pendingPrimerChoices"],
): PendingPrimerChoices | undefined {
  if (!pending?.options.length) {
    return undefined;
  }
  return {
    level: pending.level,
    commandId: pending.commandId,
    options: pending.options.map((card): PrimerChoiceCard => ({
      kind: card.kind,
      spellId: card.spellId,
      rank: card.rank,
      schoolId: card.schoolId && isSchoolId(card.schoolId) ? card.schoolId : undefined,
      tag: card.tag && SPELL_TAGS.has(card.tag as SpellTag) ? (card.tag as SpellTag) : undefined,
      vitalHealth: card.vitalHealth,
      vitalFocus: card.vitalFocus,
    })),
  };
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
