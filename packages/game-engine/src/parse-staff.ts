import type { StaffCommand } from "./state.js";

const DEFAULT_MUTE_MINUTES = 10;
const MAX_MUTE_MINUTES = 120;

export function parseStaffCommand(raw: string, characterId: string): StaffCommand | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const prefixed = /^admin\b/iu.test(trimmed);
  const body = prefixed ? trimmed.replace(/^admin\s*/iu, "").trim() : trimmed;
  if (prefixed && (body.length === 0 || /^help$/iu.test(body))) {
    return { verb: "staff-help", characterId };
  }

  const announce = /^announce\s+(.+)$/iu.exec(body);
  if (announce?.[1]) {
    return { verb: "announce", characterId, text: announce[1].trim() };
  }

  const inspect = /^inspect\s+(.+)$/iu.exec(body);
  if (inspect?.[1]) {
    return { verb: "inspect", characterId, target: inspect[1].trim() };
  }

  const mute = /^mute\s+(.+)$/iu.exec(body);
  if (mute?.[1]) {
    const parsed = splitDuration(mute[1]);
    return {
      verb: "mute",
      characterId,
      target: parsed.target,
      minutes: parsed.minutes ?? DEFAULT_MUTE_MINUTES,
    };
  }

  const kick = /^kick\s+(.+)$/iu.exec(body);
  if (kick?.[1]) {
    return { verb: "kick", characterId, target: kick[1].trim() };
  }

  if (/^audit$/iu.test(body)) {
    return { verb: "audit", characterId };
  }

  if (/^(?:roster|who)$/iu.test(body)) {
    return { verb: "roster", characterId };
  }

  const remove = /^(?:remove|disable)\s+(.+)$/iu.exec(body);
  if (remove?.[1]) {
    return { verb: "remove", characterId, target: remove[1].trim() };
  }

  return prefixed ? { verb: "staff-help", characterId } : null;
}

export function isStaffCommand(intent: { verb: string } | null): intent is StaffCommand {
  return (
    intent?.verb === "staff-help" ||
    intent?.verb === "announce" ||
    intent?.verb === "inspect" ||
    intent?.verb === "mute" ||
    intent?.verb === "kick" ||
    intent?.verb === "audit" ||
    intent?.verb === "roster" ||
    intent?.verb === "remove"
  );
}

function splitDuration(raw: string): { target: string; minutes?: number } {
  const match = /^(.+?)\s+(\d{1,3})$/u.exec(raw.trim());
  if (!match?.[1] || !match[2]) {
    return { target: raw.trim() };
  }
  const minutes = Number.parseInt(match[2], 10);
  if (Number.isNaN(minutes) || minutes < 1 || minutes > MAX_MUTE_MINUTES) {
    return { target: raw.trim() };
  }
  return { target: match[1].trim(), minutes };
}
