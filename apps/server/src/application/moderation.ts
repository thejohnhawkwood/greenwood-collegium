import { eventEnvelopeSchema, schemaVersion, type EventEnvelope } from "@greenwood/contracts";
import {
  namesMatch,
  sanitizeSpeech,
  SAY_MAX_LENGTH,
  type EngineRuntime,
  type OccupantNotice,
  type StaffCommand,
  type WorldState,
} from "@greenwood/game-engine";
import type { PlayIdentity } from "../auth/service.js";
import type { AuditAction, AuditLogRepository } from "../persistence/types.js";

export const STAFF_HELP_TEXT = [
  "Classroom commands (teacher or owner):",
  "  admin announce <message>",
  "  admin inspect <character>",
  "  admin mute <character> [minutes]",
  "  admin kick <character>",
  "  admin roster",
  "  admin remove <username>",
  "  admin audit",
  "",
  "admin roster lists unused tokens and each login with its Collegian name.",
].join("\n");

export type StaffSuccess = {
  ok: true;
  events: EventEnvelope[];
  notices: OccupantNotice[];
  kickCharacterId?: string;
};

export type StaffFailure = {
  ok: false;
  code: "forbidden" | "invalid_command" | "character_not_found" | "character_ambiguous";
  message: string;
};

export type StaffResult = StaffSuccess | StaffFailure;

export type StaffContext = {
  world: WorldState;
  actorId: string;
  identity: PlayIdentity | undefined;
  runtime: EngineRuntime;
  onlineCharacterIds: readonly string[];
  mutedUntil: Map<string, number>;
  identities: Map<string, PlayIdentity>;
  audit?: AuditLogRepository;
  now: () => Date;
  listClassroom?: () => Promise<
    | {
        invites: Array<{
          status: string;
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
      }
    | undefined
  >;
  disableAccount?: (username: string) => Promise<{ ok: true } | { ok: false; message: string }>;
};

export function canModerate(identity: PlayIdentity | undefined): boolean {
  return identity?.role === "owner" || identity?.role === "teacher";
}

export async function handleStaffCommand(
  intent: StaffCommand,
  context: StaffContext,
): Promise<StaffResult> {
  if (!canModerate(context.identity)) {
    return {
      ok: false,
      code: "forbidden",
      message: "Only a teacher can use classroom commands.",
    };
  }

  if (intent.verb === "staff-help") {
    return {
      ok: true,
      events: [noticeFor(context.actorId, STAFF_HELP_TEXT, context.runtime)],
      notices: [],
    };
  }

  if (intent.verb === "audit") {
    return {
      ok: true,
      events: [noticeFor(context.actorId, await formatAudit(context), context.runtime)],
      notices: [],
    };
  }

  if (intent.verb === "roster") {
    return {
      ok: true,
      events: [noticeFor(context.actorId, await formatRoster(context), context.runtime)],
      notices: [],
    };
  }

  if (intent.verb === "remove") {
    return removeAccount(intent.target, context);
  }

  if (intent.verb === "announce") {
    return announce(intent.text, context);
  }

  const matches = matchCourtyardCharacters(context.world, intent.target);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not see "${intent.target}" in the courtyard.`,
    };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      code: "character_ambiguous",
      message: `Which Collegian did you mean: ${matches.map((character) => character.name).join(", ")}?`,
    };
  }
  const target = matches[0];
  if (!target) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not see "${intent.target}" in the courtyard.`,
    };
  }
  if (target.id === context.actorId) {
    return {
      ok: false,
      code: "invalid_command",
      message: "Choose another Collegian.",
    };
  }
  if (intent.verb === "inspect") {
    await writeAudit(context, "inspect", target.name, target.roomId);
    const roomTitle = context.world.rooms[target.roomId]?.title ?? target.roomId;
    const login = target.accountUsername ? ` Login: ${target.accountUsername}.` : "";
    return {
      ok: true,
      events: [
        noticeFor(
          context.actorId,
          `${target.name} is in ${roomTitle}, level ${String(target.level ?? 1)}, ${String(target.experience ?? 0)} experience.${login}`,
          context.runtime,
        ),
      ],
      notices: [],
    };
  }

  const targetIdentity = context.identities.get(target.id);
  if (targetIdentity?.role === "owner" && context.identity?.role !== "owner") {
    return {
      ok: false,
      code: "forbidden",
      message: "Teachers cannot mute or kick the owner.",
    };
  }

  if (intent.verb === "mute") {
    context.mutedUntil.set(target.id, context.now().getTime() + intent.minutes * 60_000);
    await writeAudit(context, "mute", target.name, `${String(intent.minutes)} minutes`);
    return {
      ok: true,
      events: [
        noticeFor(
          context.actorId,
          `You mute ${target.name} for ${String(intent.minutes)} minutes.`,
          context.runtime,
        ),
      ],
      notices: [
        {
          characterId: target.id,
          event: noticeFor(
            target.id,
            `A teacher has muted you for ${String(intent.minutes)} minutes.`,
            context.runtime,
          ),
        },
      ],
    };
  }

  await writeAudit(context, "kick", target.name, "disconnected");
  return {
    ok: true,
    events: [
      noticeFor(context.actorId, `You send ${target.name} out of the courtyard.`, context.runtime),
    ],
    notices: [
      {
        characterId: target.id,
        event: noticeFor(
          target.id,
          "A teacher has sent you out of the courtyard.",
          context.runtime,
        ),
      },
    ],
    kickCharacterId: target.id,
  };
}

export function muteRejection(untilMs: number, nowMs: number): string {
  const minutes = Math.max(1, Math.ceil((untilMs - nowMs) / 60_000));
  return `You are muted. Ask a teacher, or wait about ${String(minutes)} minutes.`;
}

function announce(raw: string, context: StaffContext): Promise<StaffResult> {
  const text = sanitizeSpeech(raw);
  if (text.length === 0) {
    return Promise.resolve({
      ok: false,
      code: "invalid_command",
      message: "Say what the class should hear.",
    });
  }
  if (text.length > SAY_MAX_LENGTH) {
    return Promise.resolve({
      ok: false,
      code: "invalid_command",
      message: `Keep announcements to ${String(SAY_MAX_LENGTH)} characters.`,
    });
  }
  const line = `A teacher announces: ${text}`;
  return writeAudit(context, "announce", undefined, text).then(() => ({
    ok: true as const,
    events: [noticeFor(context.actorId, line, context.runtime)],
    notices: context.onlineCharacterIds
      .filter((characterId) => characterId !== context.actorId)
      .map((characterId) => ({
        characterId,
        event: noticeFor(characterId, line, context.runtime),
      })),
  }));
}

function matchCourtyardCharacters(world: WorldState, needle: string) {
  return Object.values(world.characters).filter((character) => {
    if (namesMatch(character.name, character.id, needle)) {
      return true;
    }
    return Boolean(
      character.accountUsername && namesMatch(character.accountUsername, character.id, needle),
    );
  });
}

function noticeFor(characterId: string, narration: string, runtime: EngineRuntime): EventEnvelope {
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

async function writeAudit(
  context: StaffContext,
  action: AuditAction,
  targetName: string | undefined,
  detail: string,
): Promise<void> {
  const identity = context.identity;
  if (!identity || !context.audit) {
    return;
  }
  await context.audit.append({
    at: context.now(),
    actorAccountId: identity.accountId,
    actorUsername: identity.username,
    action,
    targetName,
    detail,
  });
}

async function removeAccount(raw: string, context: StaffContext): Promise<StaffResult> {
  const matches = matchCourtyardCharacters(context.world, raw);
  const matched = matches.length === 1 ? matches[0] : undefined;
  const username = matched?.accountUsername ?? raw.trim();
  if (!context.disableAccount) {
    return {
      ok: false,
      code: "invalid_command",
      message: "That account could not be removed.",
    };
  }
  const result = await context.disableAccount(username);
  if (!result.ok) {
    return { ok: false, code: "forbidden", message: result.message };
  }
  await writeAudit(context, "remove", username, "disabled");
  const kickCharacterId =
    matched?.id ??
    Object.values(context.world.characters).find(
      (character) => character.accountUsername === username,
    )?.id;
  return {
    ok: true,
    events: [noticeFor(context.actorId, `You disable ${username}.`, context.runtime)],
    notices: kickCharacterId
      ? [
          {
            characterId: kickCharacterId,
            event: noticeFor(
              kickCharacterId,
              "A teacher has removed this account. You cannot sign in again.",
              context.runtime,
            ),
          },
        ]
      : [],
    kickCharacterId,
  };
}

async function formatRoster(context: StaffContext): Promise<string> {
  const classroom = context.listClassroom ? await context.listClassroom() : undefined;
  if (!classroom) {
    return "The classroom roster is empty.";
  }
  const unused = classroom.invites
    .filter((invite) => invite.status === "unused" && invite.token)
    .map((invite) => `  ${invite.role}  ${invite.token}`);
  const accounts = classroom.accounts.map((account) => {
    const collegian = account.characterName ?? "not finished";
    return `  ${account.username}  ${collegian}  ${account.role}  ${account.status}`;
  });
  return [
    "Unused invite tokens:",
    ...(unused.length > 0 ? unused : ["  (none)"]),
    "Logins and Collegian names:",
    ...(accounts.length > 0 ? accounts : ["  (none)"]),
  ].join("\n");
}

async function formatAudit(context: StaffContext): Promise<string> {
  const rows = context.audit ? await context.audit.listRecent(20) : [];
  if (rows.length === 0) {
    return "The classroom log is empty.";
  }
  const lines = rows.map((row) => {
    const target = row.targetName ? ` ${row.targetName}` : "";
    return `  ${row.at.toISOString()}  ${row.actorUsername}  ${row.action}${target}  ${row.detail}`;
  });
  return ["Classroom log (latest first):", ...lines].join("\n");
}
