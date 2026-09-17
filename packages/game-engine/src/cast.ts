import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import {
  actionEvent,
  applyBurning,
  concludeRound,
  openingOnly,
  prepareEncounter,
  type CombatEvent,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import type { CastIntent, Character, EngineRuntime, SpellTemplate, WorldState } from "./state.js";
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
    character.focus = focus - spell.focusCost;
    const note = applySelfEffect(character, spell);
    if (fighting) {
      const events = note ? [systemNotice(character.id, note, runtime)] : [];
      return concludeRound(world, character, fighting, events, runtime);
    }
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
    return openingOnly(character, encounter, runtime);
  }
  character.focus = focus - spell.focusCost;
  const events: CombatEvent[] = [];
  const damage = spell.damage ?? 0;
  encounter.enemy.health = Math.max(0, encounter.enemy.health - damage);
  if (spell.effect === "skip-counter") {
    encounter.effects.push({
      id: "skip-counter",
      targetId: encounter.enemy.id,
      remainingRounds: 1,
      appliedRound: encounter.round,
    });
  }
  const payload = {
    encounterId: encounter.id,
    actorId: character.id,
    actorName: character.name,
    actorKind: "player" as const,
    verb: "cast" as const,
    spellId: spell.id,
    spellName: spell.name,
    focusSpent: spell.focusCost,
    targetId: encounter.enemy.id,
    targetName: encounter.enemy.name,
    damage,
    targetHealth: encounter.enemy.health,
    targetMaxHealth: encounter.enemy.maxHealth,
  };
  events.push(
    actionEvent(encounter, payload, runtime, character.id, {
      presentationKey: spell.presentationKey,
      segments: [
        { kind: "text" as const, text: "You cast " },
        { kind: "spell" as const, id: spell.id, text: spell.name },
        { kind: "text" as const, text: " at the " },
        { kind: "target" as const, id: encounter.enemy.id, text: encounter.enemy.name },
        { kind: "text" as const, text: " for " },
        { kind: "damage" as const, text: String(damage) },
        {
          kind: "text" as const,
          text: `. It has ${String(encounter.enemy.health)} remaining.`,
        },
      ],
    }),
  );
  if (encounter.enemy.health > 0 && spell.burningRounds && spell.burningDamage) {
    events.push(
      applyBurning(encounter, spell.burningRounds, spell.burningDamage, runtime, character.id),
    );
  }
  return concludeRound(world, character, encounter, events, runtime);
}

function applySelfEffect(character: Character, spell: SpellTemplate): string | undefined {
  if (spell.effect === "avoid-hit") {
    character.ignoreNextHit = true;
    return `You cast ${spell.name}. The next blow misses.`;
  }
  if (spell.effect === "heal") {
    const heal = spell.heal ?? 4;
    const max = character.maxHealth ?? 20;
    character.health = Math.min(max, (character.health ?? max) + heal);
    return `You cast ${spell.name}. You mend ${String(heal)}.`;
  }
  if (spell.effect === "brace") {
    if (!character.braceBonus) {
      character.maxHealth = (character.maxHealth ?? 20) + 4;
      character.health = (character.health ?? 20) + 4;
      character.braceBonus = 4;
    }
    return `You cast ${spell.name}. Stone holds you a little longer.`;
  }
  if (spell.effect === "ready-strike") {
    character.nextAttackBonus = 1;
    return `You cast ${spell.name}. The next swing lands heavier.`;
  }
  if (spell.effect === "insight") {
    return spell.insight ?? `You cast ${spell.name}.`;
  }
  return `You cast ${spell.name}.`;
}

function matchSpell(world: WorldState, raw: string): SpellTemplate | undefined {
  const needle = raw.trim().toLowerCase();
  return Object.values(world.spells ?? {}).find((spell) => {
    return (
      spell.id === needle ||
      spell.name.toLowerCase() === needle ||
      spell.name.toLowerCase().includes(needle)
    );
  });
}
