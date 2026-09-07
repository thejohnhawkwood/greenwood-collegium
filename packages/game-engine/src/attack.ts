import {
  combatActionResolvedEventSchema,
  combatEndedEventSchema,
  combatStartedEventSchema,
  combatTurnStartedEventSchema,
  experienceGainedEventSchema,
  formatCombatActionResolvedText,
  formatCombatEndedText,
  formatCombatStartedText,
  formatCombatTurnStartedText,
  formatExperienceGainedText,
  renderClassicSegments,
  schemaVersion,
  type CombatActionResolvedEvent,
  type CombatActionResolvedPayload,
  type CombatEndedEvent,
  type CombatStartedEvent,
  type CombatTurnStartedEvent,
  type ExperienceGainedEvent,
  type RoomSnapshotEvent,
} from "@greenwood/contracts";
import {
  DEFAULT_PLAYER_ATTACK,
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
import { enemiesInRoom, matchEnemies } from "./enemies.js";
import { handleLook } from "./look.js";
import { charactersInRoom } from "./occupants.js";
import { enteredNotices, leftNotices, type OccupantNotice } from "./presence-events.js";
import type {
  AttackIntent,
  Character,
  Encounter,
  EnemySpawn,
  EngineRuntime,
  WorldState,
} from "./state.js";

export type AttackEvent =
  | CombatStartedEvent
  | CombatTurnStartedEvent
  | CombatActionResolvedEvent
  | CombatEndedEvent
  | ExperienceGainedEvent
  | RoomSnapshotEvent;

export type AttackSuccess = {
  ok: true;
  events: AttackEvent[];
  notices: OccupantNotice[];
  outcome: "victory" | "defeat" | "ongoing";
  roomId: string;
};

export type AttackFailure = {
  ok: false;
  code:
    | "character_not_found"
    | "room_not_found"
    | "missing_target"
    | "foe_not_found"
    | "foe_ambiguous"
    | "foe_busy"
    | "already_fighting"
    | "no_pvp";
  message: string;
};

export type AttackResult = AttackSuccess | AttackFailure;

export function handleAttack(
  world: WorldState,
  intent: AttackIntent,
  runtime: EngineRuntime,
): AttackResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
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
    const target = intent.target?.trim();
    if (target) {
      const matches = matchEnemies([spawnFromEncounter(world, current)], target).filter(
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
    return resolvePlayerAttack(world, character, current, runtime);
  }

  const target = intent.target?.trim();
  if (!target) {
    return {
      ok: false,
      code: "missing_target",
      message: "Attack whom?",
    };
  }

  const matches = matchEnemies(enemiesInRoom(world, room.id), target);
  if (matches.length === 0) {
    const needle = target.toLowerCase();
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
    return {
      ok: false,
      code: "foe_not_found",
      message: `I do not see a foe named "${target}" here.`,
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
      message: `I do not see a foe named "${target}" here.`,
    };
  }
  if (encounterUsingSpawn(world, spawn.id)) {
    return {
      ok: false,
      code: "foe_busy",
      message: `Someone else is already practising with the ${spawn.name}.`,
    };
  }

  ensurePlayerVitals(character);
  const encounter: Encounter = {
    id: runtime.nextEventId(),
    roomId: room.id,
    status: "awaiting_player",
    round: 1,
    playerId: character.id,
    spawnId: spawn.id,
    enemy: {
      id: spawn.id,
      name: spawn.name,
      health: spawn.maxHealth,
      maxHealth: spawn.maxHealth,
      attack: spawn.attack,
      experience: spawn.experience,
    },
  };
  worldEncounters(world)[encounter.id] = encounter;
  character.encounterId = encounter.id;

  const events: AttackEvent[] = [
    startedEvent(character, encounter, runtime),
    turnEvent(character, encounter, runtime),
  ];
  const resolved = resolvePlayerAttack(world, character, encounter, runtime);
  if (!resolved.ok) {
    closeEncounter(world, encounter);
    return resolved;
  }
  return {
    ...resolved,
    events: [...events, ...resolved.events],
  };
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
    attack: encounter.enemy.attack,
    experience: encounter.enemy.experience,
  };
}

function resolvePlayerAttack(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  runtime: EngineRuntime,
): AttackResult {
  ensurePlayerVitals(character);
  const events: AttackEvent[] = [];
  const playerDamage = rollAttackDamage(DEFAULT_PLAYER_ATTACK, nextRoll(runtime));
  encounter.enemy.health = Math.max(0, encounter.enemy.health - playerDamage);
  events.push(
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "attack",
        targetId: encounter.enemy.id,
        targetName: encounter.enemy.name,
        damage: playerDamage,
        targetHealth: encounter.enemy.health,
        targetMaxHealth: encounter.enemy.maxHealth,
      },
      runtime,
      character.id,
    ),
  );

  if (encounter.enemy.health <= 0) {
    const amount = encounter.enemy.experience;
    character.experience = (character.experience ?? 0) + amount;
    const roomId = character.roomId;
    events.push(endedEvent(character, encounter, "victory", roomId, runtime));
    if (amount > 0) {
      events.push(experienceEvent(character, amount, runtime));
    }
    closeEncounter(world, encounter);
    return {
      ok: true,
      events,
      notices: [],
      outcome: "victory",
      roomId,
    };
  }

  const enemyDamage = rollAttackDamage(encounter.enemy.attack, nextRoll(runtime));
  character.health = Math.max(0, (character.health ?? DEFAULT_PLAYER_MAX_HEALTH) - enemyDamage);
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
    return finishDefeat(world, character, encounter, events, runtime);
  }

  encounter.round += 1;
  events.push(turnEvent(character, encounter, runtime));
  return {
    ok: true,
    events,
    notices: [],
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

function finishDefeat(
  world: WorldState,
  character: Character,
  encounter: Encounter,
  events: AttackEvent[],
  runtime: EngineRuntime,
): AttackSuccess {
  const originId = character.roomId;
  const infirmary = world.rooms[INFIRMARY_ROOM_ID];
  character.health = character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH;
  closeEncounter(world, encounter);

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

function actionEvent(
  encounter: Encounter,
  payload: CombatActionResolvedPayload,
  runtime: EngineRuntime,
  listenerId: string,
): CombatActionResolvedEvent {
  const narration = formatCombatActionResolvedText(payload);
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
  } satisfies CombatActionResolvedEvent);
}

function endedEvent(
  character: Character,
  encounter: Encounter,
  outcome: "victory" | "defeat",
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
