import type { WorldState } from "@greenwood/game-engine";

export const DEV_CHARACTER_ID = "char-rowan";

export function createDevWorld(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A circular courtyard under drifting blue lanterns.",
        longDescription:
          "Ancient oak branches arch over a circular courtyard.\nBlue lanterns drift between the leaves.",
        zone: "academy-core",
        exits: [
          { direction: "north", toRoomId: "great-hall" },
          { direction: "east", toRoomId: "east-gate" },
          { direction: "west", toRoomId: "west-cloister" },
        ],
        fixtures: [{ id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" }],
      },
    },
    characters: {
      [DEV_CHARACTER_ID]: {
        id: DEV_CHARACTER_ID,
        name: "Rowan the Hare",
        roomId: "lantern-court",
      },
    },
  };
}
