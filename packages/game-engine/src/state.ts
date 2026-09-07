export type RoomExit = {
  direction: string;
  toRoomId: string;
};

export type RoomFixture = {
  id: string;
  name: string;
  kind: "npc" | "object";
};

export type Room = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  zone: string;
  exits: RoomExit[];
  fixtures: RoomFixture[];
};

export type Character = {
  id: string;
  name: string;
  roomId: string;
  discoveredRoomIds: string[];
  health?: number;
  maxHealth?: number;
  focus?: number;
  maxFocus?: number;
  experience?: number;
  encounterId?: string;
};

export type StatusEffect = {
  id: "burning";
  targetId: string;
  remainingRounds: number;
  tickDamage: number;
  appliedRound: number;
};

export type SpellTemplate = {
  id: string;
  name: string;
  school: string;
  description: string;
  focusCost: number;
  targetType: "enemy";
  context: "encounter";
  damage: number;
  burningRounds: number;
  burningDamage: number;
  presentationKey: string;
  helpText: string;
};

export type EnemySpawn = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId: string;
  maxHealth: number;
  attack: number;
  experience: number;
};

export type EncounterCombatant = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  experience: number;
};

export type Encounter = {
  id: string;
  roomId: string;
  status: "awaiting_player" | "closed";
  round: number;
  playerId: string;
  spawnId: string;
  enemy: EncounterCombatant;
  effects: StatusEffect[];
};

export type ItemInstance = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId?: string;
  holderCharacterId?: string;
};

export type WorldState = {
  rooms: Record<string, Room>;
  characters: Record<string, Character>;
  items?: Record<string, ItemInstance>;
  enemies?: Record<string, EnemySpawn>;
  encounters?: Record<string, Encounter>;
  spells?: Record<string, SpellTemplate>;
};

export type LookIntent = {
  verb: "look";
  characterId: string;
};

export type MoveIntent = {
  verb: "move";
  characterId: string;
  direction: string;
};

export type SayIntent = {
  verb: "say";
  characterId: string;
  text: string;
};

export type JoinIntent = {
  verb: "join";
  characterId: string;
  name: string;
  roomId: string;
};

export type LeaveIntent = {
  verb: "leave";
  characterId: string;
};

export type TakeIntent = {
  verb: "take";
  characterId: string;
  target: string;
};

export type DropIntent = {
  verb: "drop";
  characterId: string;
  target: string;
};

export type ExamineIntent = {
  verb: "examine";
  characterId: string;
  target: string;
};

export type InventoryIntent = {
  verb: "inventory";
  characterId: string;
};

export type AttackIntent = {
  verb: "attack";
  characterId: string;
  target?: string;
};

export type CastIntent = {
  verb: "cast";
  characterId: string;
  spell: string;
  target?: string;
};

export type PlayerCommand =
  | LookIntent
  | MoveIntent
  | SayIntent
  | TakeIntent
  | DropIntent
  | ExamineIntent
  | InventoryIntent
  | AttackIntent
  | CastIntent;

export type EngineRuntime = {
  now(): Date;
  nextEventId(): string;
  nextSequence(characterId: string): number;
  random?(): number;
};
