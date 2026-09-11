import { createHash } from "node:crypto";
import {
  chatSaidEventSchema,
  type EventEnvelope,
  type ModerationAction,
} from "@greenwood/contracts";
import type { AuthService, PlayIdentity } from "../auth/service.js";
import type {
  AccountRepository,
  AuditLogRepository,
  CharacterRepository,
  InviteRepository,
} from "../persistence/types.js";
import type {
  ClassroomResetRepository,
  ModerationRepository,
} from "../persistence/moderation-types.js";

export const CLASSROOM_TIME_ZONE = "America/Edmonton";
export function classroomDay(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLASSROOM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}
export function sixMonthsAgo(at: Date): string {
  const result = new Date(at);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - 6);
  const last = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result.toISOString();
}
export class ClassroomError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export type ClassroomChange = {
  accountIds: string[];
  characterIds?: string[];
  disconnect: boolean;
  refreshSession?: boolean;
  message: string;
};
export type ClassroomDeps = {
  auth: AuthService;
  accounts: AccountRepository;
  characters: CharacterRepository;
  invites: InviteRepository;
  audit: AuditLogRepository;
  moderation: ModerationRepository;
  reset: ClassroomResetRepository;
  now?: () => Date;
};

export function createClassroomService(deps: ClassroomDeps) {
  const now = deps.now ?? (() => new Date());
  const listeners = new Set<(change: ClassroomChange) => void>();
  function notify(change: ClassroomChange) {
    for (const listener of listeners) listener(change);
  }
  async function staff(actorId: string) {
    const actor = await deps.accounts.getById(actorId);
    if (!actor || actor.status !== "active" || actor.role === "student")
      throw new ClassroomError(403, "Only a teacher can use classroom controls.");
    return actor;
  }
  async function moderate(actorId: string, action: ModerationAction) {
    const actor = await staff(actorId);
    if (action.action === "chat-pause") {
      const accountIds = (await deps.accounts.listByRole("student")).map((row) => row.id);
      await deps.moderation.pauseChat(action.paused);
      try {
        await deps.audit.append({
          at: now(),
          actorAccountId: actor.id,
          actorUsername: actor.username,
          action: "chat-pause",
          detail: `${action.paused ? "Paused" : "Resumed"} student chat. ${action.reason}`,
        });
      } finally {
        notify({
          accountIds,
          disconnect: false,
          message: action.paused
            ? "Your teacher has paused student chat. You can continue playing."
            : "Student chat has resumed.",
        });
      }
      return;
    }
    const target = await deps.accounts.getById(action.accountId);
    if (!target || target.role !== "student")
      throw new ClassroomError(403, "Choose a student account. Staff accounts are protected.");
    const state = await deps.moderation.get(target.id);
    let disconnect = false;
    let characterIds: string[] | undefined;
    let message = "Your teacher updated your account.";
    if (action.action === "approve" || action.action === "reject") {
      const review = await deps.auth.reviewStatus(target.id);
      if (
        target.status !== "active" ||
        review.revision !== action.revision ||
        review.status !== "pending"
      )
        throw new ClassroomError(
          409,
          "These names have changed or were already reviewed. Refresh the roster.",
        );
      state.review = {
        revision: action.revision,
        status: action.action === "approve" ? "approved" : "rejected",
        reason: action.action === "reject" ? action.reason : undefined,
      };
      message =
        action.action === "approve"
          ? "Your names have been approved. You may enter the Collegium."
          : `Please choose your names again. ${action.reason}`;
    } else if (action.action === "mute" || action.action === "timeout") {
      const until = new Date(now().getTime() + action.minutes * 60_000).toISOString();
      if (action.action === "mute") state.mutedUntil = until;
      else {
        state.timeoutUntil = until;
        disconnect = true;
      }
      message = `${action.action === "mute" ? "You are muted" : "Your play is paused"} until ${until}. ${action.reason}`;
    } else if (action.action === "unmute") {
      delete state.mutedUntil;
      message = "You may speak again.";
    } else if (action.action === "end-timeout") {
      delete state.timeoutUntil;
      message = "Your timeout has ended.";
    } else if (action.action === "disable") {
      const result = await deps.auth.disableAccount(actor.id, target.id);
      if (!result.ok) throw new ClassroomError(403, result.message);
      disconnect = true;
      message = "Your teacher has disabled this account.";
    } else if (action.action === "restore") {
      await deps.accounts.updateStatus(target.id, "active");
      message = "Your account has been restored.";
    } else if (action.action === "remove-character") {
      characterIds = await deps.reset.purgeCharacter(target.id);
      delete state.review;
      disconnect = true;
      message = "Your character has been removed. Create a new character for teacher approval.";
    } else if (action.action === "kick") {
      disconnect = true;
      message = "Your teacher has disconnected you from the realm.";
    } else if (action.action === "rename-character") {
      const renamed = await deps.auth.renameCharacter(target.id, action.name);
      if (!renamed.ok) {
        throw new ClassroomError(
          renamed.code === "duplicate_character_name" ? 409 : 400,
          renamed.message,
        );
      }
      const review = await deps.auth.reviewStatus(target.id);
      if (!review.revision) {
        throw new ClassroomError(409, "That Collegian could not be renamed.");
      }
      state.review = { revision: review.revision, status: "approved" };
      disconnect = true;
      message = `Your teacher changed your Collegian name to ${renamed.characterName}.`;
    }
    // A separate audit outage must not leave a removed character in the live world.
    // The caller still receives an error and must refresh before retrying.
    try {
      await deps.moderation.put(target.id, state);
      await deps.audit.append({
        at: now(),
        actorAccountId: actor.id,
        actorUsername: actor.username,
        action: action.action,
        targetName: target.username,
        detail: `Account ${target.id}. ${message} ${"reason" in action ? action.reason : ""}`,
      });
    } finally {
      notify({
        accountIds: [target.id],
        characterIds,
        disconnect,
        refreshSession: disconnect && action.action !== "kick",
        message,
      });
    }
  }
  async function access(identity: PlayIdentity, speech = false): Promise<string | undefined> {
    const current = await deps.auth.recheckPlayIdentity(identity.accountId);
    if (
      !current ||
      current.characterId !== identity.characterId ||
      current.username !== identity.username ||
      current.characterName !== identity.characterName
    )
      return "Your access has changed. Return to sign-in or ask your teacher.";
    if (speech && current.role === "student") {
      const state = await deps.moderation.get(identity.accountId);
      if (state.mutedUntil && Date.parse(state.mutedUntil) > now().getTime())
        return `You are muted until ${state.mutedUntil}.`;
      if (await deps.moderation.chatPaused())
        return "Your teacher has paused student chat. You can continue playing.";
    }
    return undefined;
  }
  async function recordSpeech(
    identity: PlayIdentity,
    commandId: string,
    event: EventEnvelope,
  ): Promise<boolean> {
    const said = chatSaidEventSchema.parse(event);
    const invite = (await deps.invites.list()).find(
      (row) => row.consumedByAccountId === identity.accountId,
    );
    const at = now();
    return deps.moderation.appendSpeech({
      commandId,
      occurredAt: at.toISOString(),
      day: classroomDay(at),
      accountId: identity.accountId,
      characterId: identity.characterId,
      username: identity.username,
      characterName: identity.characterName,
      inviteReference: invite?.id,
      roomId: said.payload.roomId,
      text: said.payload.text,
    });
  }
  async function resetPreview(actorId: string) {
    const actor = await staff(actorId);
    if (actor.role !== "owner")
      throw new ClassroomError(403, "Only the owner can reset the classroom.");
    const students = await deps.accounts.listByRole("student");
    const accountIds = students.map((row) => row.id).sort();
    const characterIds: string[] = [];
    for (const id of accountIds)
      characterIds.push(...(await deps.characters.listByAccountId(id)).map((row) => row.id));
    const inviteIds = (await deps.invites.list())
      .filter((row) => row.role === "student" || accountIds.includes(row.consumedByAccountId ?? ""))
      .map((row) => row.id)
      .sort();
    const revision = createHash("sha256")
      .update(JSON.stringify([accountIds, characterIds.sort(), inviteIds]))
      .digest("hex");
    return {
      revision,
      accounts: accountIds.length,
      characters: characterIds.length,
      invites: inviteIds.length,
    };
  }
  async function resetStudents(actorId: string, revision: string) {
    const preview = await resetPreview(actorId);
    if (preview.revision !== revision)
      throw new ClassroomError(409, "The classroom changed. Review a fresh reset preview.");
    const actor = await staff(actorId);
    const result = await deps.reset.purgeStudents();
    try {
      await deps.audit.append({
        at: now(),
        actorAccountId: actor.id,
        actorUsername: actor.username,
        action: "reset-students",
        detail: `Removed ${result.accountIds.length} student accounts, ${result.characterIds.length} characters and ${result.invites} student invites. Staff and retained speech preserved.`,
      });
    } finally {
      notify({
        ...result,
        disconnect: true,
        refreshSession: true,
        message: "The classroom has been reset. Ask your teacher for a new invite.",
      });
    }
    return preview;
  }
  return {
    notifyDisabled: (accountId: string) =>
      notify({
        accountIds: [accountId],
        disconnect: true,
        refreshSession: true,
        message: "Your teacher has disabled this account.",
      }),
    staff,
    moderate,
    access,
    recordSpeech,
    resetPreview,
    resetStudents,
    subscribe: (listener: (change: ClassroomChange) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    prune: () => deps.moderation.pruneSpeech(sixMonthsAgo(now())),
    days: async (actorId: string) => {
      await staff(actorId);
      return deps.moderation.speechDays(sixMonthsAgo(now()));
    },
    speech: async (
      actorId: string,
      query: { day: string; after: number; accountId?: string; roomId?: string },
    ) => {
      await staff(actorId);
      const rows = await deps.moderation.speech({
        ...query,
        limit: 201,
        since: sixMonthsAgo(now()),
      });
      return { records: rows.slice(0, 200), hasMore: rows.length > 200 };
    },
    audit: async (actorId: string) => {
      await staff(actorId);
      return deps.audit.listRecent(100);
    },
  };
}
export type ClassroomService = ReturnType<typeof createClassroomService>;
