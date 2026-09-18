import {
  DEFAULT_PLAYER_ATTACK,
  DEFAULT_PLAYER_MAX_HEALTH,
  nextRoll,
  rollAttackDamage,
} from "./combat-state.js";
import { applyBurning, actionEvent, type CombatEvent } from "./combat-resolve.js";
import { duelOpponent, isDuel } from "./combat-party.js";
import { attackFitModifier } from "./equipment.js";
import { systemNotice } from "./system-notice.js";
import type { EventEnvelope } from "@greenwood/contracts";
import type { Character, Encounter, EngineRuntime, SpellTemplate, WorldState } from "./state.js";

export function applyAttackHit(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatEvent[] {
  const bonus = character.nextAttackBonus ?? 0;
  character.nextAttackBonus = undefined;
  const raw = Math.max(
    1,
    rollAttackDamage(DEFAULT_PLAYER_ATTACK, nextRoll(runtime)) +
      attackFitModifier(world, character) +
      bonus,
  );
  const foe = isDuel(encounter) ? duelOpponent(world, encounter, character.id) : undefined;
  const playerDamage = foe?.defending ? Math.floor(raw / 2) : raw;
  if (foe) {
    foe.health = Math.max(0, (foe.health ?? DEFAULT_PLAYER_MAX_HEALTH) - playerDamage);
    if (playerDamage > 0) {
      foe.hitThisEncounter = true;
    }
  } else {
    encounter.enemy.health = Math.max(0, encounter.enemy.health - playerDamage);
  }
  const targetId = foe?.id ?? encounter.enemy.id;
  const targetName = foe?.name ?? encounter.enemy.name;
  const targetHealth = foe?.health ?? encounter.enemy.health;
  const targetMaxHealth = foe?.maxHealth ?? encounter.enemy.maxHealth;
  return [
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "attack",
        targetId,
        targetName,
        damage: playerDamage,
        targetHealth,
        targetMaxHealth,
      },
      runtime,
      character.id,
    ),
  ];
}

export function applyDefendAction(
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatEvent[] {
  character.defending = true;
  return [
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "defend",
        targetId: character.id,
        targetName: character.name,
        damage: 0,
        targetHealth: character.health ?? DEFAULT_PLAYER_MAX_HEALTH,
        targetMaxHealth: character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      },
      runtime,
      character.id,
    ),
  ];
}

export function applyFleeAction(
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatEvent[] {
  return [
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "flee",
        targetId: encounter.enemy.id,
        targetName: encounter.enemy.name,
        damage: 0,
        targetHealth: encounter.enemy.health,
        targetMaxHealth: encounter.enemy.maxHealth,
      },
      runtime,
      character.id,
    ),
  ];
}

export function applyHostileCast(
  character: Character,
  encounter: Encounter,
  spell: SpellTemplate,
  runtime: EngineRuntime,
  world?: WorldState,
): CombatEvent[] {
  const focus = character.focus ?? 0;
  character.focus = focus - spell.focusCost;
  const events: CombatEvent[] = [];
  const damage = spell.damage ?? 0;
  const foe = world && isDuel(encounter) ? duelOpponent(world, encounter, character.id) : undefined;
  if (foe) {
    foe.health = Math.max(0, (foe.health ?? DEFAULT_PLAYER_MAX_HEALTH) - damage);
    if (damage > 0) {
      foe.hitThisEncounter = true;
    }
  } else {
    encounter.enemy.health = Math.max(0, encounter.enemy.health - damage);
  }
  const targetId = foe?.id ?? encounter.enemy.id;
  const targetName = foe?.name ?? encounter.enemy.name;
  const targetHealth = foe?.health ?? encounter.enemy.health;
  const targetMaxHealth = foe?.maxHealth ?? encounter.enemy.maxHealth;
  if (spell.effect === "skip-counter" && !foe) {
    encounter.effects.push({
      id: "skip-counter",
      targetId: encounter.enemy.id,
      remainingRounds: 1,
      appliedRound: encounter.round,
    });
  }
  events.push(
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "cast",
        spellId: spell.id,
        spellName: spell.name,
        focusSpent: spell.focusCost,
        targetId,
        targetName,
        damage,
        targetHealth,
        targetMaxHealth,
      },
      runtime,
      character.id,
      {
        presentationKey: spell.presentationKey,
        segments: [
          { kind: "text" as const, text: "You cast " },
          { kind: "spell" as const, id: spell.id, text: spell.name },
          { kind: "text" as const, text: " at the " },
          { kind: "target" as const, id: targetId, text: targetName },
          { kind: "text" as const, text: " for " },
          { kind: "damage" as const, text: String(damage) },
          {
            kind: "text" as const,
            text: `. It has ${String(targetHealth)} remaining.`,
          },
        ],
      },
    ),
  );
  if (!foe && encounter.enemy.health > 0 && spell.burningRounds && spell.burningDamage) {
    events.push(
      applyBurning(encounter, spell.burningRounds, spell.burningDamage, runtime, character.id),
    );
  }
  return events;
}

export function applySelfCast(
  character: Character,
  spell: SpellTemplate,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const focus = character.focus ?? 0;
  character.focus = focus - spell.focusCost;
  const note = applySelfEffect(character, spell);
  return [systemNotice(character.id, note ?? `You cast ${spell.name}.`, runtime)];
}

export function applySelfEffect(character: Character, spell: SpellTemplate): string | undefined {
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

export function matchSpell(world: WorldState, raw: string): SpellTemplate | undefined {
  const needle = raw.trim().toLowerCase();
  return Object.values(world.spells ?? {}).find((spell) => {
    return (
      spell.id === needle ||
      spell.name.toLowerCase() === needle ||
      spell.name.toLowerCase().includes(needle)
    );
  });
}
