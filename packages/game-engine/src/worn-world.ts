import type { Character, ItemTemplateRecord, WorldState } from "./state.js";

/**
 * H2. A worn piece may change how you are seen and where you are let in.
 *
 * Both answers come off the item template, so a costume is an ordinary item in a
 * real paper-doll slot. Nothing here touches damage, focus, or ADR-0043's
 * once-per-fight help.
 */

function wornTemplates(world: WorldState, character: Character): ItemTemplateRecord[] {
  const worn = Object.values(character.equipment ?? {});
  const templates: ItemTemplateRecord[] = [];
  for (const itemId of worn) {
    const templateId = world.items?.[itemId]?.templateId;
    const template = templateId ? world.itemTemplates?.[templateId] : undefined;
    if (template && !templates.includes(template)) {
      templates.push(template);
    }
  }
  return templates;
}

/** Plain lines to append when somebody examines this Collegian. */
export function wornExamineRiders(world: WorldState, character: Character): string[] {
  return wornTemplates(world, character)
    .map((template) => template.examineRider)
    .filter((rider): rider is string => Boolean(rider));
}

/** True when some item in the world claims to admit this room at all. */
export function roomNeedsAdmission(world: WorldState, roomId: string): boolean {
  return Object.values(world.itemTemplates ?? {}).some(
    (template) => template.admitsRoomId === roomId,
  );
}

/** True when this Collegian is wearing a piece that admits the room. */
export function wornAdmits(world: WorldState, character: Character, roomId: string): boolean {
  return wornTemplates(world, character).some((template) => template.admitsRoomId === roomId);
}

export const DEFAULT_ADMISSION_REFUSAL =
  "The way is watched. Whoever is keeping it does not know you, and does not move.";

/**
 * The refusal a closed room gives. Undefined means walk on: either nothing gates
 * this room, or the Collegian is already dressed for it.
 */
export function admissionRefusal(
  world: WorldState,
  character: Character,
  roomId: string,
): string | undefined {
  if (!roomNeedsAdmission(world, roomId) || wornAdmits(world, character, roomId)) {
    return undefined;
  }
  return world.rooms[roomId]?.admissionRefusal ?? DEFAULT_ADMISSION_REFUSAL;
}
