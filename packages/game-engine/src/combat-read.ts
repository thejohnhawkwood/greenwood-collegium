import { encounterMembers } from "./combat-party.js";
import type { Character, Encounter, LockedCombatMove } from "./state.js";

export type CombatRead = "lunge" | "brace" | "gather";

export function foeRead(encounter: Encounter): CombatRead {
  if (encounter.kind === "duel" || !encounter.reads?.length) {
    return "lunge";
  }
  const index = (encounter.round - 1) % encounter.reads.length;
  return encounter.reads[index] ?? "lunge";
}

export function readPrompt(encounter: Encounter): string | undefined {
  if (encounter.kind === "duel") {
    return "The same lesson twice lands light. A guard covers their blow and loads your next one.";
  }
  if (!encounter.reads?.length) {
    return undefined;
  }
  const name = encounter.enemy.name;
  const read = foeRead(encounter);
  if (read === "brace") {
    return `${name} sets their feet. A stick glances off. A spark does not.`;
  }
  if (read === "gather") {
    return `${name} draws back. Strike now, or the next swing is heavier.`;
  }
  return `${name} leans in. A guard meets the swing and loads your next blow.`;
}

export function strikeKey(move: LockedCombatMove): string | undefined {
  if (move.verb === "attack") {
    return "attack";
  }
  if (move.verb === "cast" && move.spell) {
    return `cast:${move.spell}`;
  }
  return undefined;
}

export function soften(damage: number, light: boolean): number {
  if (!light || damage <= 0) {
    return damage;
  }
  return Math.max(1, Math.floor(damage / 2));
}

function lightNote(reason: "repeat" | "brace" | "mirror" | "guard"): string {
  if (reason === "repeat") {
    return "The same motion is easy to read.";
  }
  if (reason === "brace") {
    return "The brace catches the stick.";
  }
  if (reason === "mirror") {
    return "You mirror each other.";
  }
  return "Their guard covers the blow.";
}

export function adjustOutgoing(
  character: Character,
  encounter: Encounter,
  kind: "attack" | "cast",
  spellId: string | undefined,
  damage: number,
  hitsRoomFoe: boolean,
): { damage: number; readNote?: string } {
  const loaded = character.nextStrikeBonus ?? 0;
  character.nextStrikeBonus = undefined;
  const key = kind === "cast" && spellId ? `cast:${spellId}` : "attack";
  const repeated = character.lastStrike === key;
  character.lastStrike = key;
  const bracedStick = kind === "attack" && hitsRoomFoe && foeRead(encounter) === "brace";
  const mirrored = character.strikeLight === "mirror";
  const guarded = character.strikeLight === "guard";
  character.strikeLight = undefined;
  let reason: "repeat" | "brace" | "mirror" | "guard" | undefined;
  if (repeated) {
    reason = "repeat";
  } else if (bracedStick) {
    reason = "brace";
  } else if (mirrored) {
    reason = "mirror";
  } else if (guarded) {
    reason = "guard";
  }
  const total = reason ? soften(damage + loaded, true) : damage + loaded;
  if (hitsRoomFoe && total > 0) {
    encounter.woundedThisRound = true;
  }
  if (reason) {
    return { damage: total, readNote: lightNote(reason) };
  }
  if (loaded > 0) {
    return { damage: total, readNote: "The loaded guard lands." };
  }
  return { damage: total };
}

export function clearLesson(character: Character): void {
  character.lastStrike = undefined;
  character.strikeLight = undefined;
}

export function markDuelStrikeLights(characters: Record<string, Character>, encounter: Encounter): void {
  if (encounter.kind !== "duel") {
    return;
  }
  const ids = encounterMembers(encounter);
  for (const id of ids) {
    const character = characters[id];
    const mine = encounter.locked?.[id];
    if (!character || !mine) {
      continue;
    }
    character.strikeLight = undefined;
    const key = strikeKey(mine);
    if (!key) {
      continue;
    }
    for (const otherId of ids) {
      if (otherId === id) {
        continue;
      }
      const theirs = encounter.locked?.[otherId];
      if (!theirs) {
        continue;
      }
      if (theirs.verb === "defend") {
        character.strikeLight = "guard";
        break;
      }
      if (strikeKey(theirs) === key) {
        character.strikeLight = "mirror";
        break;
      }
    }
  }
}

export function awardDuelGuards(characters: Record<string, Character>, encounter: Encounter): void {
  if (encounter.kind !== "duel") {
    return;
  }
  const ids = encounterMembers(encounter);
  for (const id of ids) {
    const character = characters[id];
    const mine = encounter.locked?.[id];
    if (!character || mine?.verb !== "defend") {
      continue;
    }
    const covered = ids.some((otherId) => {
      if (otherId === id) {
        return false;
      }
      const verb = encounter.locked?.[otherId]?.verb;
      return verb === "attack" || verb === "cast";
    });
    if (covered) {
      character.nextStrikeBonus = (character.nextStrikeBonus ?? 0) + 2;
    }
  }
}
