import type { Appearance } from "@greenwood/contracts";
export type RoomExit = {
  direction: string;
  toRoomId: string;
};

export type SchoolId = "ember" | "thorn" | "veil" | "stars" | "stone" | "steel";

export type DialogueChoice = {
  say: string;
  label: string;
  next?: string;
  school?: SchoolId;
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
  map?: { x: number; y: number; z?: number };
  shortDescription: string;
  longDescription: string;
  zone: string;
  visualState?: string;
  exits: RoomExit[];
  fixtures: RoomFixture[];
};

export type OpenConversation = {
  npcId: string;
  nodeId?: string;
};

export type Character = {
  appearance?: Appearance;
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
  gender?: "female" | "male";
  equippedItemId?: string;
  /** Worn item ids by paper-doll slot. Two-handed weapons occupy main-hand only. */
  equipment?: Partial<
    Record<
      | "helmet"
      | "necklace"
      | "cloak"
      | "armor"
      | "gloves"
      | "boots"
      | "ring-1"
      | "ring-2"
      | "main-hand"
      | "off-hand"
      | "ranged",
      string
    >
  >;
  openConversation?: OpenConversation;
  schoolId?: SchoolId;
  nextAttackBonus?: number;
  ignoreNextHit?: boolean;
  braceBonus?: number;
  hitThisEncounter?: boolean;
  defending?: boolean;
  defeatedSpawnIds?: string[];
  knownSpells?: KnownSpellLeaf[];
  pendingPrimerChoices?: PendingPrimerChoices;
  primerAwardedLevels?: number[];
  halveNextHit?: boolean;
  ashShroud?: boolean;
  readySpellIds?: string[];
  readySpellBonus?: number;
  /** First incoming hit of this fight already took the paper-doll guard. */
  gearGuardUsed?: boolean;
  /** First cast of this fight already took the paper-doll focus help. */
  gearFocusUsed?: boolean;
  /** Last committed swing or leaf. The same one, next lock, lands lighter. */
  lastStrike?: string;
  /** Extra damage on the next swing or spark after a guard that met a blow. */
  nextStrikeBonus?: number;
  /** Set for this lock when a classmate mirrors the lesson or covers it. */
  strikeLight?: "mirror" | "guard";
};

export type SpellTag = "strike" | "control" | "ward" | "gift";

export type KnownSpellLeaf = {
  spellId: string;
  rank: number;
  pennedBy: string;
};

export type PrimerChoiceKind = "upgrade" | "unlock" | "courtesy" | "vital";

export type PrimerChoiceCard = {
  kind: PrimerChoiceKind;
  spellId?: string;
  rank?: number;
  schoolId?: SchoolId;
  tag?: SpellTag;
  vitalHealth?: number;
  vitalFocus?: number;
};

export type PendingPrimerChoices = {
  level: number;
  options: PrimerChoiceCard[];
  commandId?: string;
};

export type SpellRankNumbers = {
  focusCost?: number;
  damage?: number;
  heal?: number;
  burningRounds?: number;
  burningDamage?: number;
  restoreFocus?: number;
  insight?: string;
  marginNote?: string;
};

export type QuestObjectiveKind =
  "look" | "say" | "take" | "visit" | "examine" | "talk" | "defeat" | "cast";

export type QuestObjective = {
  id: string;
  kind: QuestObjectiveKind;
  label: string;
  itemTemplateId?: string;
  roomId?: string;
  targetId?: string;
  requires?: string[];
  /** H1. Finishing this objective ends the quest on that outcome. */
  outcome?: string;
};

export type QuestOutcome = {
  id: string;
  completionNarration: string;
  itemRewardTemplateId?: string;
};

export type QuestTemplate = {
  id: string;
  title: string;
  introNarration: string;
  reminderNarration: string;
  giverNpcId?: string;
  requiresQuestIds?: string[];
  completionNarration?: string;
  experienceReward: number;
  itemRewardTemplateId?: string;
  outcomes?: QuestOutcome[];
  objectives: QuestObjective[];
};

export type QuestProgress = {
  questId: string;
  status: "active" | "completed";
  completedObjectiveIds: string[];
  rewardGranted: boolean;
  /** H1. Which ending this Collegian reached. Absent on a quest without a fork. */
  outcome?: string;
};

export type StatusEffect = {
  id: "burning" | "skip-counter" | "weaken";
  targetId: string;
  remainingRounds: number;
  tickDamage?: number;
  appliedRound: number;
};

export type SpellEffectId =
  | "skip-counter"
  | "avoid-hit"
  | "heal"
  | "brace"
  | "ready-strike"
  | "riposte"
  | "insight"
  | "restore-focus"
  | "halve-hit"
  | "weaken"
  | "ready-spell"
  | "leech";

export type SpellTemplate = {
  id: string;
  name: string;
  school: string;
  description: string;
  focusCost: number;
  targetType: "enemy" | "self";
  context: "encounter" | "any";
  damage?: number;
  effect?: SpellEffectId;
  heal?: number;
  insight?: string;
  burningRounds?: number;
  burningDamage?: number;
  restoreFocus?: number;
  readySpellIds?: string[];
  minLevel?: number;
  tag?: SpellTag;
  pennedBy?: string;
  ranks?: SpellRankNumbers[];
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
  maxFocus?: number;
  attack: number;
  experience: number;
  minParty?: number;
  loot?: string[];
  victoryNarration?: string;
  lockNarration?: string;
  reads?: Array<"lunge" | "brace" | "gather">;
};

export type LockedCombatMove = {
  verb: "attack" | "cast" | "defend" | "flee";
  spell?: string;
};

export type EncounterCombatant = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  focus: number;
  maxFocus: number;
  attack: number;
  experience: number;
};

export type Encounter = {
  id: string;
  roomId: string;
  status: "awaiting_intents" | "closed";
  round: number;
  playerId: string;
  playerIds?: string[];
  locked?: Record<string, LockedCombatMove>;
  spawnId: string;
  kind?: "duel";
  lockDeadlineAt: string;
  lockNarration?: string;
  reads?: Array<"lunge" | "brace" | "gather">;
  /** The foe drew back and was not struck, so the next lean-in hits harder. */
  gatherPending?: boolean;
  woundedThisRound?: boolean;
  readSettled?: boolean;
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
  equipSlot?: string;
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
  equipSlot?: string;
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
  equipSlot?: string;
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
  duelChallenges?: Record<string, { fromId: string; createdAt: string }>;
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
  appearance?: Appearance;
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
  gender?: "female" | "male";
  discoveredRoomIds?: string[];
  defeatedSpawnIds?: string[];
  schoolId?: SchoolId;
  knownSpells?: KnownSpellLeaf[];
  pendingPrimerChoices?: PendingPrimerChoices;
  primerAwardedLevels?: number[];
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

export type ByeIntent = {
  verb: "bye";
  characterId: string;
};

export type DrinkIntent = {
  verb: "drink";
  characterId: string;
  target?: string;
};

export type EatIntent = {
  verb: "eat";
  characterId: string;
  target?: string;
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

export type DefendIntent = {
  verb: "defend";
  characterId: string;
};

export type FleeIntent = {
  verb: "flee";
  characterId: string;
};

export type CombatExpireIntent = {
  verb: "combat-expire";
  characterId: string;
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

export type InkIntent = {
  verb: "ink";
  characterId: string;
  target: string;
};

export type SpellsIntent = {
  verb: "spells";
  characterId: string;
  target?: string;
};

export type EquipIntent = {
  verb: "equip";
  characterId: string;
  target: string;
};

export type UnequipIntent = {
  verb: "unequip";
  characterId: string;
  target: string;
};

export type MapIntent = {
  verb: "map";
  characterId: string;
};

export type TravelIntent = {
  verb: "travel";
  characterId: string;
  target: string;
};

export type SeekIntent = {
  verb: "seek";
  characterId: string;
  target: string;
};

export type DuelIntent = {
  verb: "duel";
  characterId: string;
  action: "challenge" | "accept" | "decline";
  target?: string;
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
  | ByeIntent
  | DrinkIntent
  | EatIntent
  | InventoryIntent
  | AttackIntent
  | DefendIntent
  | FleeIntent
  | CastIntent
  | HelpIntent
  | QuestsIntent
  | StatsIntent
  | SpellsIntent
  | InkIntent
  | EquipIntent
  | UnequipIntent
  | MapIntent
  | TravelIntent
  | SeekIntent
  | DuelIntent
  | StaffCommand;

export type EngineRuntime = {
  now(): Date;
  nextEventId(): string;
  nextSequence(characterId: string): number;
  random?(): number;
};
