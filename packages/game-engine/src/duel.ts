import {
  DEFAULT_PLAYER_ATTACK,
  DEFAULT_PLAYER_MAX_FOCUS,
  DEFAULT_PLAYER_MAX_HEALTH,
  ensurePlayerVitals,
  rejectIfInCombat,
  worldEncounters,
  type InCombatFailure,
} from "./combat-state.js";
import { beginLockWindow } from "./combat-lock.js";
import { openingOnly, type CombatFailure, type CombatSuccess } from "./combat-resolve.js";
import { namesMatch } from "./names.js";
import { charactersInRoom } from "./occupants.js";
import type { Character, DuelIntent, EngineRuntime, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export const DUEL_CHALLENGE_ID = "duel-challenge";

export type DuelFailure = CombatFailure | InCombatFailure;
export type DuelResult = CombatSuccess | DuelFailure;

export function pendingDuelFrom(world: WorldState, characterId: string): string | undefined {
  return world.duelChallenges?.[characterId]?.fromId;
}

export function handleDuel(
  world: WorldState,
  intent: DuelIntent,
  runtime: EngineRuntime,
): DuelResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  if (intent.action === "accept") {
    return acceptDuel(world, character, intent.target, runtime);
  }
  if (intent.action === "decline") {
    return declineDuel(world, character, runtime);
  }
  return challengeDuel(world, character, intent.target ?? "", runtime);
}

function challengeDuel(
  world: WorldState,
  character: Character,
  target: string,
  runtime: EngineRuntime,
): DuelResult {
  const blocked = rejectIfInCombat(world, character.id);
  if (blocked) {
    return blocked;
  }
  const named = target.trim();
  if (named.length === 0) {
    return { ok: false, code: "missing_target", message: "Duel whom?" };
  }
  const matches = charactersInRoom(world, character.roomId, character.id).filter((other) =>
    namesMatch(other.name, other.id, named),
  );
  if (matches.length === 0) {
    return {
      ok: false,
      code: "foe_not_found",
      message: `I do not see a classmate named "${named}" here.`,
    };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      code: "foe_ambiguous",
      message: `Which classmate: ${matches.map((other) => other.name).join(", ")}?`,
    };
  }
  const other = matches[0];
  if (!other) {
    return {
      ok: false,
      code: "foe_not_found",
      message: `I do not see a classmate named "${named}" here.`,
    };
  }
  if (other.encounterId) {
    return {
      ok: false,
      code: "already_fighting",
      message: `${other.name} is already in a fight.`,
    };
  }
  world.duelChallenges ??= {};
  world.duelChallenges[other.id] = {
    fromId: character.id,
    createdAt: runtime.now().toISOString(),
  };
  return {
    ok: true,
    events: [
      systemNotice(
        character.id,
        `You ask ${other.name} for a classroom duel. Wait until they agree.`,
        runtime,
      ),
    ],
    notices: [
      {
        characterId: other.id,
        event: systemNotice(
          other.id,
          `${character.name} asks for a classroom duel. Type duel accept or duel decline.`,
          runtime,
        ),
      },
    ],
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

function acceptDuel(
  world: WorldState,
  character: Character,
  target: string | undefined,
  runtime: EngineRuntime,
): DuelResult {
  const blocked = rejectIfInCombat(world, character.id);
  if (blocked) {
    return blocked;
  }
  const fromId = world.duelChallenges?.[character.id]?.fromId;
  if (!fromId) {
    return {
      ok: false,
      code: "foe_not_found",
      message: "Nobody has asked you to duel.",
    };
  }
  const challenger = world.characters[fromId];
  if (!challenger || challenger.roomId !== character.roomId) {
    clearChallenge(world, character.id);
    return {
      ok: false,
      code: "foe_not_found",
      message: "That classmate is no longer here.",
    };
  }
  if (target?.trim() && !namesMatch(challenger.name, challenger.id, target)) {
    return {
      ok: false,
      code: "foe_not_found",
      message: `Nobody named "${target}" has asked you to duel.`,
    };
  }
  if (challenger.encounterId) {
    return {
      ok: false,
      code: "already_fighting",
      message: `${challenger.name} is already in a fight.`,
    };
  }
  clearChallenge(world, character.id);
  return startDuel(world, challenger, character, runtime);
}

function declineDuel(world: WorldState, character: Character, runtime: EngineRuntime): DuelResult {
  const fromId = world.duelChallenges?.[character.id]?.fromId;
  if (!fromId) {
    return {
      ok: false,
      code: "foe_not_found",
      message: "Nobody has asked you to duel.",
    };
  }
  const challenger = world.characters[fromId];
  clearChallenge(world, character.id);
  return {
    ok: true,
    events: [systemNotice(character.id, "You decline the duel.", runtime)],
    notices: challenger
      ? [
          {
            characterId: challenger.id,
            event: systemNotice(challenger.id, `${character.name} declines the duel.`, runtime),
          },
        ]
      : [],
    outcome: "ongoing",
    roomId: character.roomId,
  };
}

function startDuel(
  world: WorldState,
  challenger: Character,
  accepter: Character,
  runtime: EngineRuntime,
): CombatSuccess {
  ensurePlayerVitals(challenger);
  ensurePlayerVitals(accepter);
  const encounter = {
    id: runtime.nextEventId(),
    roomId: accepter.roomId,
    status: "awaiting_intents" as const,
    round: 1,
    playerId: challenger.id,
    playerIds: [challenger.id, accepter.id],
    spawnId: `duel-${challenger.id}-${accepter.id}`,
    kind: "duel" as const,
    lockDeadlineAt: runtime.now().toISOString(),
    enemy: {
      id: challenger.id,
      name: challenger.name,
      health: challenger.health ?? DEFAULT_PLAYER_MAX_HEALTH,
      maxHealth: challenger.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      focus: challenger.focus ?? DEFAULT_PLAYER_MAX_FOCUS,
      maxFocus: challenger.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS,
      attack: DEFAULT_PLAYER_ATTACK,
      experience: 0,
    },
    effects: [],
  };
  beginLockWindow(encounter, runtime);
  worldEncounters(world)[encounter.id] = encounter;
  challenger.encounterId = encounter.id;
  accepter.encounterId = encounter.id;
  return openingOnly(world, accepter, encounter, runtime);
}

function clearChallenge(world: WorldState, characterId: string): void {
  if (world.duelChallenges) {
    delete world.duelChallenges[characterId];
  }
}

export function replyToDuelChallenge(
  world: WorldState,
  characterId: string,
  spoken: string,
  runtime: EngineRuntime,
): DuelResult | undefined {
  if (!world.duelChallenges?.[characterId]) {
    return undefined;
  }
  const needle = spoken.trim().toLowerCase();
  if (needle === "1" || needle === "accept" || needle === "yes") {
    return handleDuel(world, { verb: "duel", characterId, action: "accept" }, runtime);
  }
  if (needle === "2" || needle === "decline" || needle === "no") {
    return handleDuel(world, { verb: "duel", characterId, action: "decline" }, runtime);
  }
  return undefined;
}
