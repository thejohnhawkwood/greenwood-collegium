import type { EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { rejectIfInCombat } from "./combat-state.js";
import { namesMatch } from "./names.js";
import { ORCHARD_APPLES_ID, restoreCharacterVitals } from "./recover.js";
import type { EatIntent, EngineRuntime, RoomFixture, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type EatSuccess = { ok: true; event: EventEnvelope };
export type EatFailure = {
  ok: false;
  code: "character_not_found" | "in_combat" | "no_food" | "food_ambiguous";
  message: string;
};
export type EatResult = EatSuccess | EatFailure;

export function isFood(fixture: RoomFixture): boolean {
  return (
    fixture.kind === "object" &&
    (fixture.id === ORCHARD_APPLES_ID ||
      namesMatch(fixture.name, fixture.id, "apple") ||
      namesMatch(fixture.name, fixture.id, "fruit") ||
      /apple|fruit|bread|food|ration/i.test(`${fixture.id} ${fixture.name}`))
  );
}

export function handleEat(world: WorldState, intent: EatIntent, runtime: EngineRuntime): EatResult {
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
  const foods = fixturesVisibleTo(world, character).filter(isFood);
  const target = intent.target?.trim() ?? "";
  const matches = target
    ? foods.filter((fixture) => namesMatch(fixture.name, fixture.id, target))
    : foods;
  if (matches.length === 0) {
    return {
      ok: false,
      code: "no_food",
      message: target
        ? `There is no ${target} here to eat.`
        : "There is nothing to eat here. Try the fallen apples in the South Orchard, or drink from the well in Lantern Court.",
    };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      code: "food_ambiguous",
      message: `Which food? ${matches.map((fixture) => `eat ${fixture.name}`).join(" or ")}.`,
    };
  }
  const restored = restoreCharacterVitals(character);
  return {
    ok: true,
    event: systemNotice(
      character.id,
      restored
        ? "You eat. Health and focus return."
        : "The food is honest. You are already rested.",
      runtime,
    ),
  };
}
