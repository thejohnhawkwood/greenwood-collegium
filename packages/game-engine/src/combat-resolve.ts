import {
  combatActionResolvedEventSchema,
  combatEndedEventSchema,
  combatStartedEventSchema,
  combatStatusAppliedEventSchema,
  combatTurnStartedEventSchema,
  experienceGainedEventSchema,
  formatCombatActionResolvedText,
  formatCombatEndedText,
  formatCombatStartedText,
  formatCombatStatusAppliedText,
  formatCombatTurnStartedText,
  formatExperienceGainedText,
  renderClassicSegments,
  schemaVersion,
  type CombatActionResolvedEvent,
  type CombatActionResolvedPayload,
  type CombatEndedEvent,
  type CombatStartedEvent,
  type CombatStatusAppliedEvent,
  type CombatStatusAppliedPayload,
  type CombatTurnStartedEvent,
  type ExperienceGainedEvent,
  type EventEnvelope,
  type RoomSnapshotEvent,
  type SemanticSegment,
} from "@greenwood/contracts";
import {
  DEFAULT_PLAYER_MAX_FOCUS,
  DEFAULT_PLAYER_MAX_HEALTH,
  INFIRMARY_ROOM_ID,
  activeEncounter,
  closeEncounter,
  encounterUsingSpawn,
  ensurePlayerVitals,
  nextRoll,
  rollAttackDamage,
  worldEncounters,
} from "./combat-state.js";
import {
  enemiesInRoom,
  hasDefeatedSpawn,
  matchEnemies,
  recordSpawnDefeat,
  worldEnemies,
} from "./enemies.js";
import { worldItems } from "./items.js";
import { handleLook } from "./look.js";
import { charactersInRoom } from "./occupants.js";
import { enteredNotices, leftNotices, type OccupantNotice } from "./presence-events.js";
import type { Character, Encounter, EnemySpawn, EngineRuntime, WorldState } from "./state.js";
import { beginLockWindow, enemyFocusFromSpawn } from "./combat-lock.js";
import {
  dropEncounterMember,
  encounterMembers,
  isChorus,
  joinEncounter,
  presentCollegians,
} from "./combat-party.js";
import { systemNotice } from "./system-notice.js";

export type CombatEvent =
  | CombatStartedEvent
  | CombatTurnStartedEvent
  | CombatActionResolvedEvent
  | CombatStatusAppliedEvent
  | CombatEndedEvent
  | ExperienceGainedEvent
  | RoomSnapshotEvent;

export type CombatSuccess = {
  ok: true;
  events: EventEnvelope[];
  notices: OccupantNotice[];
  outcome: "victory" | "defeat" | "fled" | "ongoing";
  roomId: string;
};

export type CombatFailure = {
  ok: false;
  code:
    | "character_not_found"
    | "room_not_found"
    | "missing_target"
    | "foe_not_found"
    | "foe_ambiguous"
    | "foe_busy"
    | "already_fighting"
    | "no_pvp"
    | "not_in_combat"
    | "lock_open"
    | "party_too_small"
    | "foe_already_stood"
    | "already_locked";
  message: string;
};

export type PreparedEncounter =
  | {
      ok: true;
      character: Character;
      encounter: Encounter;
      started: boolean;
    }
  | CombatFailure;

export function prepareEncounter(
  world: WorldState,
  characterId: string,
  target: string | undefined,
  runtime: EngineRuntime,
  missingTargetMessage = "Attack whom?",
): PreparedEncounter {
  const character = world.characters[characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${characterId}".`,
    };
  }

  const room = world.rooms[character.roomId];
  if (!room) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }

  const current = activeEncounter(world, character.id);
  if (current) {
    if (current.roomId !== room.id) {
      return {
        ok: false,
        code: "already_fighting",
        message: `You are already facing the ${current.enemy.name}.`,
      };
    }
    const named = target?.trim();
    if (named) {
      const matches = matchEnemies([spawnFromEncounter(world, current)], named).filter(
        (spawn) => spawn.id === current.spawnId,
      );
      if (matches.length === 0) {
        return {
          ok: false,
          code: "already_fighting",
          message: `You are already facing the ${current.enemy.name}.`,
        };
      }
    }
    return { ok: true, character, encounter: current, started: false };
  }

  const named = target?.trim();
  if (!named) {
    return {
      ok: false,
      code: "missing_target",
      message: missingTargetMessage,
    };
  }

  const matches = matchEnemies(enemiesInRoom(world, room.id, character), named);
  if (matches.length === 0) {
    const needle = named.toLowerCase();
    const students = charactersInRoom(world, room.id, character.id).filter((other) => {
      return other.id === needle || other.name.toLowerCase().includes(needle);
    });
    if (students.length > 0) {
      return {
        ok: false,
        code: "no_pvp",
        message: "Classroom lessons do not allow fighting other students.",
      };
    }
    const hidden = matchEnemies(
      Object.values(worldEnemies(world)).filter((enemy) => enemy.roomId === room.id),
      named,
    );
    if (hidden.some((spawn) => (spawn.minParty ?? 1) > 1)) {
      const boss = hidden[0];
      return {
        ok: false,
        code: "foe_already_stood",
        message: `The ${boss?.name ?? named} does not rise for those who have already stood here. Bring a Collegian who has not.`,
      };
    }
    return {
      ok: false,
      code: "foe_not_found",
      message: `I do not see a foe named "${named}" here.`,
    };
  }
  if (matches.length > 1) {
    const names = matches.map((enemy) => enemy.name).join(", ");
    return {
      ok: false,
      code: "foe_ambiguous",
      message: `Which did you mean: ${names}?`,
    };
  }

  const spawn = matches[0];
  if (!spawn) {
    return {
      ok: false,
      code: "foe_not_found",
      message: `I do not see a foe named "${named}" here.`,
    };
  }
  const existing = encounterUsingSpawn(world, spawn.id);
  if (existing) {
    if ((spawn.minParty ?? 1) > 1 || isChorus(existing)) {
      const wasMember = encounterMembers(existing).includes(character.id);
      if (!wasMember) {
        ensurePlayerVitals(character);
        joinEncounter(character, existing);
      }
      return { ok: true, character, encounter: existing, started: !wasMember };
    }
    return {
      ok: false,
      code: "foe_busy",
      message: `Someone else is already practising with the ${spawn.name}.`,
    };
  }

  const present = presentCollegians(world, room.id);
  const need = spawn.minParty ?? 1;
  if (present.length < need) {
    return {
      ok: false,
      code: "party_too_small",
      message: `The ${spawn.name} will not square up for fewer than ${String(need)} Collegians. Bring classmates.`,
    };
  }

  ensurePlayerVitals(character);
  const focus = enemyFocusFromSpawn(spawn);
  const encounter: Encounter = {
    id: runtime.nextEventId(),
    roomId: room.id,
    status: "awaiting_intents",
    round: 1,
    playerId: character.id,
    spawnId: spawn.id,
    lockDeadlineAt: runtime.now().toISOString(),
    enemy: {
      id: spawn.id,
      name: spawn.name,
      health: spawn.maxHealth,
      maxHealth: spawn.maxHealth,
      focus: focus.focus,
      maxFocus: focus.maxFocus,
      attack: spawn.attack,
      experience: spawn.experience,
    },
    effects: [],
  };
  if (need > 1) {
    encounter.playerIds = present.map((member) => member.id);
    for (const member of present) {
      ensurePlayerVitals(member);
      member.encounterId = encounter.id;
    }
  }
  beginLockWindow(encounter, runtime);
  worldEncounters(world)[encounter.id] = encounter;
  character.encounterId = encounter.id;
  return { ok: true, character, encounter, started: true };
}

export function openingEvents(
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatEvent[] {
  return [startedEvent(character, encounter, runtime), turnEvent(character, encounter, runtime)];
}

export function openingOnly(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatSuccess {
  const events = openingEvents(character, encounter, runtime);
  const notices = encounterMembers(encounter).flatMap((id) => {
    if (id === character.id) {
      return [];
    }
    const member = world.characters[id];
    if (!member) {
      return [];
    }
    return openingEvents(member, encounter, runtime).map((event) => ({
      characterId: id,
      event,
    }));
  });
  return {
    ok: true,
    events,
    notices,
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

export function finishFlee(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  const roomId = character.roomId;
  events.push(endedEvent(character, encounter, "fled", roomId, runtime));
  closeEncounter(world, encounter);
  return {
    ok: true,
    events,
    notices: [],
    outcome: "fled",
    roomId,
  };
}

export function consumeSkipCounter(encounter: Encounter): boolean {
  const skipCounter = encounter.effects.some((effect) => effect.id === "skip-counter");
  encounter.effects = encounter.effects.filter((effect) => effect.id !== "skip-counter");
  return skipCounter;
}

export function deliverEnemyReply(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
  skipCounter: boolean,
): "ongoing" | "defeat" {
  if (character.ignoreNextHit) {
    character.ignoreNextHit = false;
    character.defending = undefined;
    events.push(systemNotice(character.id, "The next blow misses.", runtime));
    return "ongoing";
  }
  if (skipCounter) {
    character.defending = undefined;
    events.push(
      systemNotice(character.id, `The ${encounter.enemy.name} cannot answer this round.`, runtime),
    );
    return "ongoing";
  }
  const raw = rollAttackDamage(encounter.enemy.attack, nextRoll(runtime));
  const enemyDamage = character.defending ? Math.floor(raw / 2) : raw;
  character.defending = undefined;
  character.health = Math.max(0, (character.health ?? DEFAULT_PLAYER_MAX_HEALTH) - enemyDamage);
  if (enemyDamage > 0) {
    character.hitThisEncounter = true;
  }
  events.push(
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: encounter.enemy.id,
        actorName: encounter.enemy.name,
        actorKind: "enemy",
        verb: "attack",
        targetId: character.id,
        targetName: character.name,
        damage: enemyDamage,
        targetHealth: character.health,
        targetMaxHealth: character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      },
      runtime,
      character.id,
    ),
  );
  if (character.health <= 0) {
    return "defeat";
  }
  return "ongoing";
}

export function advanceEncounterClock(
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): void {
  tickBurning(encounter, events, runtime, character.id);
  if (encounter.enemy.health <= 0) {
    return;
  }
  encounter.round += 1;
  beginLockWindow(encounter, runtime);
  events.push(turnEvent(character, encounter, runtime));
}

export function concludeRound(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  if (encounter.enemy.health <= 0) {
    return finishVictory(world, character, encounter, events, runtime);
  }

  const skipCounter = consumeSkipCounter(encounter);
  const reply = deliverEnemyReply(world, character, encounter, events, runtime, skipCounter);
  if (reply === "defeat") {
    return finishDefeat(world, character, encounter, events, runtime);
  }

  advanceEncounterClock(character, encounter, events, runtime);
  if (encounter.enemy.health <= 0) {
    return finishVictory(world, character, encounter, events, runtime);
  }

  return {
    ok: true,
    events,
    notices: [],
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

export function applyBurning(
  encounter: Encounter,
  rounds: number,
  tickDamage: number,
  runtime: EngineRuntime,
  listenerId: string,
): CombatStatusAppliedEvent {
  const existing = encounter.effects.find((effect) => effect.id === "burning");
  if (existing) {
    existing.remainingRounds = rounds;
    existing.tickDamage = tickDamage;
    existing.appliedRound = encounter.round;
  } else {
    encounter.effects.push({
      id: "burning",
      targetId: encounter.enemy.id,
      remainingRounds: rounds,
      tickDamage,
      appliedRound: encounter.round,
    });
  }
  return statusEvent(
    encounter,
    {
      encounterId: encounter.id,
      targetId: encounter.enemy.id,
      targetName: encounter.enemy.name,
      statusId: "burning",
      remainingRounds: rounds,
      phase: "applied",
    },
    runtime,
    listenerId,
  );
}

function tickBurning(
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
  listenerId: string,
): void {
  const remaining: typeof encounter.effects = [];
  for (const effect of encounter.effects) {
    if (effect.id !== "burning" || effect.appliedRound >= encounter.round) {
      remaining.push(effect);
      continue;
    }
    encounter.enemy.health = Math.max(0, encounter.enemy.health - (effect.tickDamage ?? 0));
    effect.remainingRounds -= 1;
    events.push(
      statusEvent(
        encounter,
        {
          encounterId: encounter.id,
          targetId: encounter.enemy.id,
          targetName: encounter.enemy.name,
          statusId: "burning",
          remainingRounds: effect.remainingRounds,
          phase: "tick",
          tickDamage: effect.tickDamage,
          targetHealth: encounter.enemy.health,
          targetMaxHealth: encounter.enemy.maxHealth,
        },
        runtime,
        listenerId,
      ),
    );
    if (effect.remainingRounds <= 0) {
      events.push(
        statusEvent(
          encounter,
          {
            encounterId: encounter.id,
            targetId: encounter.enemy.id,
            targetName: encounter.enemy.name,
            statusId: "burning",
            remainingRounds: 0,
            phase: "ended",
          },
          runtime,
          listenerId,
        ),
      );
    } else {
      remaining.push(effect);
    }
  }
  encounter.effects = remaining;
}

function settleDefeat(world: WorldState, encounter: Encounter, firstTimers: Character[]): string | undefined {
  const spawn = worldEnemies(world)[encounter.spawnId];
  for (const id of encounterMembers(encounter)) {
    const member = world.characters[id];
    if (member) {
      recordSpawnDefeat(member, encounter.spawnId);
    }
  }
  if (firstTimers.length === 0) {
    return undefined;
  }
  const names = dropCombatLoot(world, spawn, encounter);
  if (names.length === 0) {
    return undefined;
  }
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `The ${encounter.enemy.name} is dead. ${list} ${names.length === 1 ? "falls" : "fall"} to the floor.`;
}

function dropCombatLoot(
  world: WorldState,
  spawn: EnemySpawn | undefined,
  encounter: Encounter,
): string[] {
  const names: string[] = [];
  for (const templateId of spawn?.loot ?? []) {
    const template = world.itemTemplates?.[templateId];
    if (!template) {
      continue;
    }
    const instanceId = `item-${spawn!.id}-loot-${templateId}-${encounter.id}`;
    if (worldItems(world)[instanceId]) {
      continue;
    }
    worldItems(world)[instanceId] = {
      id: instanceId,
      templateId: template.id,
      name: template.name,
      examineDescription: template.examineDescription,
      roomId: encounter.roomId,
      category: template.category,
      itemType: template.itemType,
    };
    names.push(template.name);
  }
  return names;
}

function spawnFromEncounter(world: WorldState, encounter: Encounter): EnemySpawn {
  const spawn = world.enemies?.[encounter.spawnId];
  if (spawn) {
    return spawn;
  }
  return {
    id: encounter.spawnId,
    templateId: encounter.enemy.id,
    name: encounter.enemy.name,
    examineDescription: encounter.enemy.name,
    roomId: encounter.roomId,
    maxHealth: encounter.enemy.maxHealth,
    maxFocus: encounter.enemy.maxFocus,
    attack: encounter.enemy.attack,
    experience: encounter.enemy.experience,
  };
}

export function finishVictory(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  const amount = encounter.enemy.experience;
  const roomId = character.roomId;
  const notices: CombatSuccess["notices"] = [];
  const firstTimers = encounterMembers(encounter)
    .map((id) => world.characters[id])
    .filter((member): member is Character => Boolean(member) && !hasDefeatedSpawn(member, encounter.spawnId));
  const firstTimerIds = new Set(firstTimers.map((member) => member.id));
  for (const id of encounterMembers(encounter)) {
    const member = world.characters[id];
    if (!member) {
      continue;
    }
    const award = firstTimerIds.has(id) ? amount : 0;
    if (award > 0) {
      member.experience = (member.experience ?? 0) + award;
    }
    if (id === character.id) {
      events.push(endedEvent(member, encounter, "victory", roomId, runtime));
      if (award > 0) {
        events.push(experienceEvent(member, award, runtime));
      }
      continue;
    }
    const awarded: EventEnvelope[] = [
      endedEvent(member, encounter, "victory", member.roomId, runtime),
    ];
    if (award > 0) {
      awarded.push(experienceEvent(member, award, runtime));
    }
    notices.push(...awarded.map((event) => ({ characterId: id, event })));
  }
  const lootLine = settleDefeat(world, encounter, firstTimers);
  if (lootLine) {
    events.push(systemNotice(character.id, lootLine, runtime));
    for (const id of encounterMembers(encounter)) {
      if (id === character.id) {
        continue;
      }
      notices.push({
        characterId: id,
        event: systemNotice(id, lootLine, runtime),
      });
    }
  }
  closeEncounter(world, encounter);
  return {
    ok: true,
    events,
    notices,
    outcome: "victory",
    roomId,
  };
}

export function finishDefeat(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: EventEnvelope[],
  runtime: EngineRuntime,
): CombatSuccess {
  const originId = character.roomId;
  const infirmary = world.rooms[INFIRMARY_ROOM_ID];
  character.health = character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH;
  character.focus = character.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS;
  dropEncounterMember(world, encounter, character.id);
  if (encounterMembers(encounter).length === 0) {
    closeEncounter(world, encounter);
  }

  if (!infirmary) {
    events.push(endedEvent(character, encounter, "defeat", character.roomId, runtime));
    return {
      ok: true,
      events,
      notices: [],
      outcome: "defeat",
      roomId: character.roomId,
    };
  }

  const leavers = charactersInRoom(world, originId, character.id);
  character.roomId = infirmary.id;
  if (!character.discoveredRoomIds.includes(infirmary.id)) {
    character.discoveredRoomIds.push(infirmary.id);
  }
  const arrivals = charactersInRoom(world, infirmary.id, character.id);
  events.push(endedEvent(character, encounter, "defeat", infirmary.id, runtime));
  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (look.ok) {
    events.push(look.event);
  }
  return {
    ok: true,
    events,
    notices: [
      ...leftNotices(leavers, character, originId, runtime),
      ...enteredNotices(arrivals, character, infirmary.id, runtime),
    ],
    outcome: "defeat",
    roomId: infirmary.id,
  };
}

function startedEvent(
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatStartedEvent {
  const payload = {
    encounterId: encounter.id,
    roomId: encounter.roomId,
    characterId: character.id,
    characterName: character.name,
    enemyId: encounter.enemy.id,
    enemyName: encounter.enemy.name,
    enemyHealth: encounter.enemy.health,
    enemyMaxHealth: encounter.enemy.maxHealth,
    enemyFocus: encounter.enemy.focus,
    enemyMaxFocus: encounter.enemy.maxFocus,
  };
  const narration = formatCombatStartedText(payload);
  const segments = [
    { kind: "text" as const, text: "You square up to the " },
    { kind: "actor" as const, id: encounter.enemy.id, text: encounter.enemy.name },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from combat.started narration");
  }
  return combatStartedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "combat.started",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: encounter.roomId,
    encounterId: encounter.id,
    narration,
    segments,
    payload,
  } satisfies CombatStartedEvent);
}

function turnEvent(
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): CombatTurnStartedEvent {
  const payload = {
    encounterId: encounter.id,
    round: encounter.round,
    actorId: character.id,
    actorName: character.name,
  };
  const narration = formatCombatTurnStartedText(payload);
  return combatTurnStartedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "combat.turn_started",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    encounterId: encounter.id,
    narration,
    payload,
  } satisfies CombatTurnStartedEvent);
}

export function actionEvent(
  encounter: Encounter,
  payload: CombatActionResolvedPayload,
  runtime: EngineRuntime,
  listenerId: string,
  extras: { presentationKey?: string; segments?: SemanticSegment[] } = {},
): CombatActionResolvedEvent {
  const narration = formatCombatActionResolvedText(payload);
  if (extras.segments && renderClassicSegments(extras.segments) !== narration) {
    throw new Error("classic segments drifted from combat.action_resolved narration");
  }
  return combatActionResolvedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(listenerId),
    schemaVersion,
    type: "combat.action_resolved",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    encounterId: encounter.id,
    narration,
    payload,
    ...(extras.presentationKey ? { presentationKey: extras.presentationKey } : {}),
    ...(extras.segments ? { segments: extras.segments } : {}),
  } satisfies CombatActionResolvedEvent);
}

function statusEvent(
  encounter: Encounter,
  payload: CombatStatusAppliedPayload,
  runtime: EngineRuntime,
  listenerId: string,
): CombatStatusAppliedEvent {
  const narration = formatCombatStatusAppliedText(payload);
  return combatStatusAppliedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(listenerId),
    schemaVersion,
    type: "combat.status_applied",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    encounterId: encounter.id,
    narration,
    payload,
  } satisfies CombatStatusAppliedEvent);
}

function endedEvent(
  character: Character,
  encounter: Encounter,
  outcome: "victory" | "defeat" | "fled",
  roomId: string,
  runtime: EngineRuntime,
): CombatEndedEvent {
  const payload = {
    encounterId: encounter.id,
    characterId: character.id,
    roomId,
    enemyName: encounter.enemy.name,
    outcome,
  };
  const narration = formatCombatEndedText(payload);
  return combatEndedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "combat.ended",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId,
    encounterId: encounter.id,
    narration,
    payload,
  } satisfies CombatEndedEvent);
}

function experienceEvent(
  character: Character,
  amount: number,
  runtime: EngineRuntime,
): ExperienceGainedEvent {
  const payload = {
    characterId: character.id,
    amount,
    total: character.experience ?? amount,
  };
  const narration = formatExperienceGainedText(payload);
  return experienceGainedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "progress.experience_gained",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration,
    payload,
  } satisfies ExperienceGainedEvent);
}
