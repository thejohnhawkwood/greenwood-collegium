import type { EventEnvelope } from "@greenwood/contracts";
import {
  DEFAULT_PLAYER_MAX_FOCUS,
  DEFAULT_PLAYER_MAX_HEALTH,
  ensurePlayerVitals,
} from "./combat-state.js";
import { itemsHeldBy, worldItems } from "./items.js";
import { knownLeaves } from "./primer.js";
import { experienceToNextLesson } from "./progression.js";
import { SCHOOL_TITLE } from "./schools.js";
import type { EngineRuntime, StatsIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type StatsSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type StatsFailure = {
  ok: false;
  code: "character_not_found" | "room_not_found";
  message: string;
};

export type StatsResult = StatsSuccess | StatsFailure;

export function handleStats(
  world: WorldState,
  intent: StatsIntent,
  runtime: EngineRuntime,
): StatsResult {
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

  ensurePlayerVitals(character);
  const health = character.health ?? DEFAULT_PLAYER_MAX_HEALTH;
  const maxHealth = character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH;
  const focus = character.focus ?? DEFAULT_PLAYER_MAX_FOCUS;
  const maxFocus = character.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS;
  const held = heldItemName(world, character.id, character.equippedItemId);
  const lesson = character.level ?? 1;
  const remaining = experienceToNextLesson(lesson, character.experience ?? 0);
  const school = character.schoolId ? SCHOOL_TITLE[character.schoolId] : "none yet";
  const leaves = knownLeaves(character).length;
  const nextLesson =
    remaining === undefined
      ? "Next lesson: the Primer is as full as a 1–20 career allows."
      : `Next lesson: ${String(remaining)} experience to lesson ${String(lesson + 1)}`;
  const narration = [
    `Health: ${String(health)}/${String(maxHealth)}`,
    `Focus: ${String(focus)}/${String(maxFocus)}`,
    `School: ${school}`,
    `Primer: ${String(leaves)} ${leaves === 1 ? "leaf" : "leaves"}`,
    nextLesson,
    `Location: ${room.title}`,
    `Equipped: ${held}`,
  ].join("\n");
  return { ok: true, event: systemNotice(character.id, narration, runtime) };
}

function heldItemName(
  world: WorldState,
  characterId: string,
  equippedItemId: string | undefined,
): string {
  if (equippedItemId) {
    const equipped = Object.values(worldItems(world)).find(
      (item) => item.id === equippedItemId || item.templateId === equippedItemId,
    );
    if (equipped) {
      return equipped.name;
    }
    const template = world.itemTemplates?.[equippedItemId];
    if (template) {
      return template.name;
    }
  }
  const carried = itemsHeldBy(world, characterId)[0];
  return carried?.name ?? "nothing in hand";
}
