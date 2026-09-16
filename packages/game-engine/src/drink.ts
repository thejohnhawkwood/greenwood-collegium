import type { EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { rejectIfInCombat } from "./combat-state.js";
import { namesMatch } from "./names.js";
import { COURTYARD_WELL_ID, restoreCharacterVitals } from "./recover.js";
import type { DrinkIntent, EngineRuntime, RoomFixture, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type DrinkSuccess = { ok: true; event: EventEnvelope };
export type DrinkFailure = {
  ok: false;
  code: "character_not_found" | "in_combat" | "no_well" | "well_ambiguous";
  message: string;
};
export type DrinkResult = DrinkSuccess | DrinkFailure;

function isWell(fixture: RoomFixture): boolean {
  return (
    fixture.kind === "object" &&
    (fixture.id === COURTYARD_WELL_ID || namesMatch(fixture.name, fixture.id, "well"))
  );
}

export function handleDrink(
  world: WorldState,
  intent: DrinkIntent,
  runtime: EngineRuntime,
): DrinkResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: "Your character is not in the realm.",
    };
  }
  const busy = rejectIfInCombat(world, character.id);
  if (busy) {
    return busy;
  }
  const wells = fixturesVisibleTo(world, character).filter(isWell);
  const target = intent.target?.trim() ?? "";
  const matches = target
    ? wells.filter((fixture) => namesMatch(fixture.name, fixture.id, target))
    : wells;
  if (matches.length === 0) {
    return {
      ok: false,
      code: "no_well",
      message: target
        ? `There is no ${target} here to drink from.`
        : "There is no well here. Walk to Lantern Court and type drink well.",
    };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      code: "well_ambiguous",
      message: `Which well? ${matches.map((fixture) => `drink ${fixture.name}`).join(" or ")}.`,
    };
  }
  const restored = restoreCharacterVitals(character);
  return {
    ok: true,
    event: systemNotice(
      character.id,
      restored
        ? "You drink from the courtyard well. Health and focus return."
        : "The well's water is cool. You are already rested.",
      runtime,
    ),
  };
}
