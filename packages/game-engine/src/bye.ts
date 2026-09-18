import type { EventEnvelope } from "@greenwood/contracts";
import { handleDuel } from "./duel.js";
import type { OccupantNotice } from "./presence-events.js";
import type { ByeIntent, EngineRuntime, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type ByeSuccess = { ok: true; event: EventEnvelope; notices?: OccupantNotice[] };
export type ByeFailure = {
  ok: false;
  code: "character_not_found" | "no_conversation";
  message: string;
};
export type ByeResult = ByeSuccess | ByeFailure;

export function handleBye(world: WorldState, intent: ByeIntent, runtime: EngineRuntime): ByeResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: "Your character is not in the realm.",
    };
  }
  if (world.duelChallenges?.[character.id]) {
    const declined = handleDuel(
      world,
      { verb: "duel", characterId: character.id, action: "decline" },
      runtime,
    );
    if (declined.ok) {
      return {
        ok: true,
        event: declined.events[0] ?? systemNotice(character.id, "You decline the duel.", runtime),
        notices: declined.notices,
      };
    }
  }
  if (!character.openConversation) {
    return {
      ok: false,
      code: "no_conversation",
      message: "You are not in a conversation.",
    };
  }
  character.openConversation = undefined;
  return {
    ok: true,
    event: systemNotice(character.id, "You step back from the conversation.", runtime),
  };
}
