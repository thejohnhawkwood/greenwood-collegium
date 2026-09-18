import type { EventEnvelope } from "@greenwood/contracts";
import {
  applyAttackHit,
  applyDefendAction,
  applyFleeAction,
  applyHostileCast,
  applySelfCast,
  matchSpell,
} from "./combat-apply.js";
import {
  advanceEncounterClock,
  concludeRound,
  consumeSkipCounter,
  deliverEnemyReply,
  finishDefeat,
  finishFlee,
  finishVictory,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import { activeEncounter, closeEncounter } from "./combat-state.js";
import { dropEncounterMember, encounterMembers, isDuel, partyNotices } from "./combat-party.js";
import { systemNotice } from "./system-notice.js";
import type { Character, Encounter, EngineRuntime, LockedCombatMove, WorldState } from "./state.js";

export function lockChorusMove(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  move: LockedCombatMove,
  runtime: EngineRuntime,
): CombatSuccess | CombatFailure {
  encounter.locked ??= {};
  if (encounter.locked[character.id]) {
    return {
      ok: false,
      code: "already_locked",
      message: "You have already locked a move this turn.",
    };
  }
  encounter.locked[character.id] = move;
  const waiting = encounterMembers(encounter).filter((id) => !encounter.locked?.[id]);
  if (waiting.length > 0) {
    return {
      ok: true,
      events: [
        systemNotice(character.id, "You lock a move. Waiting for your classmates.", runtime),
      ],
      notices: partyNotices(
        encounter,
        character.id,
        [
          systemNotice(
            character.id,
            `${character.name} locks a move. The clock still runs.`,
            runtime,
          ),
        ],
        runtime,
      ),
      outcome: "ongoing",
      roomId: character.roomId,
    };
  }
  return resolveChorus(world, character, encounter, runtime);
}

export function resolveChorus(
  world: WorldState,
  actor: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatSuccess {
  const events: EventEnvelope[] = [];
  const notices: CombatSuccess["notices"] = [];
  const order = encounterMembers(encounter);
  for (const id of order) {
    const member = world.characters[id];
    const move = encounter.locked?.[id];
    if (!member || !move || !activeEncounter(world, id)) {
      continue;
    }
    const applied = applyLockedMove(world, member, encounter, move, runtime);
    events.push(...applied.events);
    notices.push(...applied.notices);
    if (applied.outcome === "fled") {
      return fanActor(actor, encounter, { ...applied, events, notices }, runtime);
    }
    if (isDuel(encounter)) {
      continue;
    }
    if (encounter.enemy.health <= 0) {
      return fanActor(
        actor,
        encounter,
        concludeRound(world, member, encounter, events, runtime),
        runtime,
        notices,
      );
    }
  }

  const remaining = encounterMembers(encounter)
    .map((id) => world.characters[id])
    .filter((member): member is Character => Boolean(member && activeEncounter(world, member.id)));
  if (remaining.length === 0) {
    return {
      ok: true,
      events,
      notices,
      outcome: "fled",
      roomId: actor.roomId,
    };
  }

  encounter.locked = {};
  if (isDuel(encounter)) {
    return fanActor(
      actor,
      encounter,
      concludeDuelRound(world, actor, remaining, encounter, events, runtime),
      runtime,
      notices,
    );
  }
  const concluded = concludePartyRound(world, actor, remaining, encounter, events, runtime);
  return fanActor(actor, encounter, concluded, runtime, notices);
}

function concludeDuelRound(
  world: WorldState,
  actor: Character,
  remaining: Character[],
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  const notices: CombatSuccess["notices"] = [];
  const down = remaining.filter((member) => (member.health ?? 0) <= 0);
  if (down.length > 0) {
    for (const loser of down) {
      const defeated = finishDefeat(world, loser, encounter, [], runtime);
      notices.push(...defeated.notices);
      if (loser.id === actor.id) {
        events.push(...defeated.events);
      } else {
        notices.push(...defeated.events.map((event) => ({ characterId: loser.id, event })));
      }
    }
    const living = remaining.filter((member) => (member.health ?? 0) > 0);
    if (living.length === 0) {
      closeEncounterIfEmpty(world, encounter);
      return {
        ok: true,
        events,
        notices,
        outcome: "defeat",
        roomId: actor.roomId,
      };
    }
    const winner = living[0] ?? actor;
    const won = finishVictory(
      world,
      winner,
      encounter,
      winner.id === actor.id ? events : [],
      runtime,
    );
    if (winner.id !== actor.id) {
      notices.push(...won.events.map((event) => ({ characterId: winner.id, event })));
      notices.push(...won.notices);
      return { ok: true, events, notices, outcome: "ongoing", roomId: actor.roomId };
    }
    return { ...won, notices: [...notices, ...won.notices] };
  }
  const clockEvents: EventEnvelope[] = [];
  advanceEncounterClock(actor, encounter, clockEvents, runtime);
  events.push(...clockEvents);
  return {
    ok: true,
    events,
    notices,
    outcome: "ongoing",
    roomId: actor.roomId,
  };
}

function closeEncounterIfEmpty(world: WorldState, encounter: Encounter): void {
  if (encounterMembers(encounter).length === 0) {
    closeEncounter(world, encounter);
  }
}

function concludePartyRound(
  world: WorldState,
  actor: Character,
  remaining: Character[],
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  if (remaining.length === 1) {
    return concludeRound(world, remaining[0] ?? actor, encounter, events, runtime);
  }
  const skipCounter = consumeSkipCounter(encounter);
  const notices: CombatSuccess["notices"] = [];
  for (const member of remaining) {
    const reply = deliverEnemyReply(world, member, encounter, events, runtime, skipCounter);
    if (reply === "defeat") {
      const defeated = finishDefeat(world, member, encounter, [], runtime);
      notices.push(...defeated.notices);
      if (member.id === actor.id) {
        events.push(...defeated.events);
      } else {
        notices.push(...defeated.events.map((event) => ({ characterId: member.id, event })));
      }
    }
  }
  const living = encounterMembers(encounter)
    .map((id) => world.characters[id])
    .filter((member): member is Character => Boolean(member && activeEncounter(world, member.id)));
  if (living.length === 0) {
    return {
      ok: true,
      events,
      notices,
      outcome: "defeat",
      roomId: actor.roomId,
    };
  }
  const clockEvents: EventEnvelope[] = [];
  const clockBearer = living[0] ?? actor;
  advanceEncounterClock(clockBearer, encounter, clockEvents, runtime);
  if (encounter.enemy.health <= 0) {
    const won = finishVictory(world, actor, encounter, [...events, ...clockEvents], runtime);
    return { ...won, notices: [...notices, ...won.notices] };
  }
  if (actor.encounterId === encounter.id) {
    events.push(...clockEvents);
  } else {
    notices.push(...clockEvents.map((event) => ({ characterId: clockBearer.id, event })));
  }
  return {
    ok: true,
    events,
    notices,
    outcome: actor.encounterId === encounter.id ? "ongoing" : "defeat",
    roomId: actor.roomId,
  };
}

function applyLockedMove(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  move: LockedCombatMove,
  runtime: EngineRuntime,
): CombatSuccess {
  if (move.verb === "defend") {
    return {
      ok: true,
      events: applyDefendAction(character, encounter, runtime),
      notices: [],
      outcome: "ongoing",
      roomId: character.roomId,
    };
  }
  if (move.verb === "flee") {
    const fleeEvents = applyFleeAction(character, encounter, runtime);
    dropEncounterMember(world, encounter, character.id);
    if (isDuel(encounter) || encounterMembers(encounter).length === 0) {
      return finishFlee(world, character, encounter, fleeEvents, runtime);
    }
    return {
      ok: true,
      events: [
        ...fleeEvents,
        systemNotice(character.id, "You break from the lesson and step back.", runtime),
      ],
      notices: [],
      outcome: "ongoing",
      roomId: character.roomId,
    };
  }
  if (move.verb === "cast") {
    const spell = move.spell ? matchSpell(world, move.spell) : undefined;
    if (!spell) {
      return {
        ok: true,
        events: applyDefendAction(character, encounter, runtime),
        notices: [],
        outcome: "ongoing",
        roomId: character.roomId,
      };
    }
    if (spell.targetType === "self" || ((spell.damage ?? 0) === 0 && spell.effect)) {
      return {
        ok: true,
        events: applySelfCast(character, spell, runtime),
        notices: [],
        outcome: "ongoing",
        roomId: character.roomId,
      };
    }
    return {
      ok: true,
      events: applyHostileCast(character, encounter, spell, runtime, world),
      notices: [],
      outcome: "ongoing",
      roomId: character.roomId,
    };
  }
  return {
    ok: true,
    events: applyAttackHit(world, character, encounter, runtime),
    notices: [],
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

function fanActor(
  actor: Character,
  encounter: Encounter,
  result: CombatSuccess,
  runtime: EngineRuntime,
  extra: CombatSuccess["notices"] = [],
): CombatSuccess {
  return {
    ...result,
    notices: [
      ...extra,
      ...result.notices,
      ...partyNotices(encounter, actor.id, result.events, runtime),
    ],
  };
}
