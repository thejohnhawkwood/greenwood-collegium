export type RoomExit = {
  direction: string;
  toRoomId: string;
};

export type DialogueChoice = {
  say: string;
  label: string;
  next?: string;
};

export type DialogueNode = {
  text: string;
  choices?: DialogueChoice[];
};

export type DialogueTree = {
  start: string;
  nodes: Record<string, DialogueNode>;
};

export type RoomFixture = {
  id: string;
  name: string;
  kind: "npc" | "object";
  dialogue?: string;
  dialogueTree?: DialogueTree;
  examineDescription?: string;
  lookDescription?: string;
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

export type OpenConversation = {
  npcId: string;
  nodeId: string;
};

export type Character = {
  id: string;
  name: string;
  accountUsername?: string;
  lookDescription?: string;
  examineDescription?: string;
  roomId: string;
  discoveredRoomIds: string[];
  health?: number;
  maxHealth?: number;
  focus?: number;
  maxFocus?: number;
  experience?: number;
  level?: number;
  encounterId?: string;
  speciesId?: string;
  equippedItemId?: string;
  openConversation?: OpenConversation;
};

export type QuestObjectiveKind = "look" | "say" | "take" | "visit" | "examine" | "talk";

export type QuestObjective = {
  id: string;
  kind: QuestObjectiveKind;
  label: string;
  itemTemplateId?: string;
  roomId?: string;
  targetId?: string;
  requires?: string[];
};

export type QuestTemplate = {
  id: string;
  title: string;
  introNarration: string;
  reminderNarration: string;
  giverNpcId?: string;
  completionNarration?: string;
  experienceReward: number;
  objectives: QuestObjective[];
};

export type QuestProgress = {
  questId: string;
  status: "active" | "completed";
  completedObjectiveIds: string[];
  rewardGranted: boolean;
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
  lookDescription?: string;
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

export type ItemCategory = "key" | "book" | "weapon" | "ordinary";

export type ItemTemplateRecord = {
  id: string;
  name: string;
  examineDescription: string;
  category?: ItemCategory;
  itemType?: string;
  training?: boolean;
};

export type StarterItemPlacement = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId: string;
  category?: ItemCategory;
  itemType?: string;
};

export type ItemInstance = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId?: string;
  holderCharacterId?: string;
  availableToCharacterId?: string;
  category?: ItemCategory;
  itemType?: string;
  training?: boolean;
};

export type WorldState = {
  rooms: Record<string, Room>;
  characters: Record<string, Character>;
  items?: Record<string, ItemInstance>;
  itemTemplates?: Record<string, ItemTemplateRecord>;
  starterPlacements?: StarterItemPlacement[];
  enemies?: Record<string, EnemySpawn>;
  encounters?: Record<string, Encounter>;
  spells?: Record<string, SpellTemplate>;
  questTemplates?: Record<string, QuestTemplate>;
  quests?: Record<string, Record<string, QuestProgress>>;
  speciesProficiencies?: Record<string, string>;
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
  accountUsername?: string;
  lookDescription?: string;
  examineDescription?: string;
  experience?: number;
  level?: number;
  speciesId?: string;
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

export type TalkIntent = {
  verb: "talk";
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

export type HelpIntent = {
  verb: "help";
  characterId: string;
  topic?: string;
};

export type QuestsIntent = {
  verb: "quests";
  characterId: string;
};

export type StatsIntent = {
  verb: "stats";
  characterId: string;
};

export type StaffHelpIntent = {
  verb: "staff-help";
  characterId: string;
};

export type AnnounceIntent = {
  verb: "announce";
  characterId: string;
  text: string;
};

export type InspectIntent = {
  verb: "inspect";
  characterId: string;
  target: string;
};

export type MuteIntent = {
  verb: "mute";
  characterId: string;
  target: string;
  minutes: number;
};

export type KickIntent = {
  verb: "kick";
  characterId: string;
  target: string;
};

export type AuditIntent = {
  verb: "audit";
  characterId: string;
};

export type RosterIntent = {
  verb: "roster";
  characterId: string;
};

export type RemoveIntent = {
  verb: "remove";
  characterId: string;
  target: string;
};

export type StaffCommand =
  | StaffHelpIntent
  | AnnounceIntent
  | InspectIntent
  | MuteIntent
  | KickIntent
  | AuditIntent
  | RosterIntent
  | RemoveIntent;

export type PlayerCommand =
  | LookIntent
  | MoveIntent
  | SayIntent
  | TakeIntent
  | DropIntent
  | ExamineIntent
  | TalkIntent
  | InventoryIntent
  | AttackIntent
  | CastIntent
  | HelpIntent
  | QuestsIntent
  | StatsIntent
  | StaffCommand;

export type EngineRuntime = {
  now(): Date;
  nextEventId(): string;
  nextSequence(chara