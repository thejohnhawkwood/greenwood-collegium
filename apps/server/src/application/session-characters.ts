import type { WorldState } from "@greenwood/game-engine";

export const DEV_CHARACTERS = [
  { id: "char-rowan", name: "Rowan the Hare" },
  { id: "char-moss", name: "Moss the Mole" },
  { id: "char-pip", name: "Pip the Sparrow" },
  { id: "char-thistle", name: "Thistle the Hedgehog" },
] as const;

export const DEV_START_ROOM_ID = "lantern-court";

export function claimDevCharacter(world: WorldState): (typeof DEV_CHARACTERS)[number] | undefined {
  return DEV_CHARACTERS.find((template) => world.characters[template.id] === undefined);
}
