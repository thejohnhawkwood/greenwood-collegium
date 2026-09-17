import { applyHostileCast, applySelfCast, applySelfEffect, matchSpell } from "./combat-apply.js";
import { lockChorusMove } from "./combat-chorus.js";
import { isChorus } from "./combat-party.js";
import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import {
  concludeRound,
  openingOnly,
  prepareEncounter,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import type { CastIntent, EngineRuntime, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type CastSuccess = CombatSuccess;
export type CastFailure =
  | CombatFailure
  | {
      ok: false;
      code: "missing_spell" | "unknown_spell" | "not_enough_focus" | "gift_locked";
      message: string;
    };
export type CastResult = CastSuccess | CastFailure;

export function handleCast(
  world: WorldState,
  intent: CastIntent,
  runtime: EngineRuntime,
): CastResult {
  const spellName = intent.spell.trim();
  if (!spellName) {
    return {
      ok: false,
      code: "missing_spell",
      message: "Cast which spell?",
    };
  }

  const spell = matchSpell(world, spellName);
  if (!spell) {
    return {
      ok: false,
      code: "unknown_spell",
      message: `I do not know a spell called "${spellName}."`,
    };
  }

  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  const locked = (spell.minLevel ?? 1) >= 3;
  if (locked && (!character.schoolId || character.schoolId !== spell.school)) {
    return {
      ok: false,
      code: "gift_locked",
      message: "That gift belongs to another School.",
    };
  }
  if (locked && (character.level ?? 1) < (spell.minLevel ?? 3)) {
    return {
      ok: false,
      code: "gift_locked",
      message: "Your School gift opens at the third year-mark.",
    };
  }
  if (spell.effect === "riposte" && !character.hitThisEncounter) {
    return {
      ok: false,
      code: "gift_locked",
      message: "Riposte waits until you have been hit in this fight.",
    };
  }
  ensurePlayerVitals(character);
  const focus = character.focus ?? 0;
  if (focus < spell.focusCost) {
    return {
      ok: false,
      code: "not_enough_focus",
      message: `You need ${String(spell.focusCost)} focus to cast ${spell.name}. You have ${String(focus)}.`,
    };
  }

  const fighting = activeEncounter(world, character.id);
  if (spell.context === "encounter" && spell.targetType === "self" && !fighting) {
    return {
      ok: false,
      code: "missing_target",
      message: `${spell.name} is for a fight.`,
    };
  }

  if (spell.targetType === "self" || ((spell.damage ?? 0) === 0 && spell.effect)) {
    if (fighting && isChorus(fighting)) {
      return lockChorusMove(world, character, fighting, { verb: "cast", spell: spell.id }, runtime);
    }
    if (fighting) {
      return concludeRound(
        world,
        character,
        fighting,
        applySelfCast(character, spell, runtime),
        runtime,
      );
    }
    const note = applySelfEffect(character, spell);
    character.focus = focus - spell.focusCost;
    return {
      ok: true,
      events: [systemNotice(character.id, note ?? `You cast ${spell.name}.`, runtime)],
      notices: [],
      outcome: "ongoing",
      roomId: character.roomId,
    };
  }

  const prepared = prepareEncounter(
    world,
    intent.characterId,
    intent.target,
    runtime,
    `Cast ${spell.name} at whom?`,
  );
  if (!prepared.ok) {
    return prepared;
  }

  const { encounter } = prepared;
  if (prepared.started) {
    return openingOnly(world, character, encounter, runtime);
  }
  if (isChorus(encounter)) {
    return lockChorusMove(world, character, encounter, { verb: "cast", spell: spell.id }, runtime);
  }
  return concludeRound(
    world,
    character,
    encounter,
    applyHostileCast(character, encounter, spell, runtime),
    runtime,
  );
}
