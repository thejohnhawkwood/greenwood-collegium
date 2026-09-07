import { ensurePlayerVitals } from "./combat-state.js";
import {
  actionEvent,
  applyBurning,
  concludeRound,
  openingEvents,
  prepareEncounter,
  type CombatEvent,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import type { CastIntent, EngineRuntime, SpellTemplate, WorldState } from "./state.js";

export type CastSuccess = CombatSuccess;
export type CastFailure =
  | CombatFailure
  | {
      ok: false;
      code: "missing_spell" | "unknown_spell" | "not_enough_focus";
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
  ensurePlayerVitals(character);
  const focus = character.focus ?? 0;
  if (focus < spell.focusCost) {
    return {
      ok: false,
      code: "not_enough_focus",
      message: `You need ${String(spell.focusCost)} focus to cast ${spell.name}. You have ${String(focus)}.`,
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

  character.focus = focus - spell.focusCost;
  const { encounter } = prepared;
  const events: CombatEvent[] = prepared.started
    ? openingEvents(character, encounter, runtime)
    : [];
  encounter.enemy.health = Math.max(0, encounter.enemy.health - spell.damage);
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
    damage: spell.damage,
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
        { kind: "damage" as const, text: String(spell.damage) },
        {
          kind: "text" as const,
          text: `. It has ${String(encounter.enemy.health)} remaining.`,
        },
      ],
    }),
  );
  if (encounter.enemy.health > 0) {
    events.push(
      applyBurning(encounter, spell.burningRounds, spell.burningDamage, runtime, character.id),
    );
  }
  return concludeRound(world, character, encounter, events, runtime);
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
