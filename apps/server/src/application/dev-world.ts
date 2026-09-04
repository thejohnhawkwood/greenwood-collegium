import type { WorldState } from "@greenwood/game-engine";

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
      "great-hall": {
        id: "great-hall",
        title: "Great Hall",
        shortDescription: "A high oak hall lit by hanging lanterns.",
        longDescription:
          "Long tables run beneath oak beams.\nSchool banners hang between the lanterns.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "lantern-court" }],
        fixtures: [],
      },
      "west-cloister": {
        id: "west-cloister",
        title: "West Cloister",
        shortDescription: "A mossy covered walk beside the court.",
        longDescription:
          "Stone arches frame a quiet walk.\nMoss holds the rain in small bright beads.",
        zone: "academy-core",
        exits: [{ direction: "east", toRoomId: "lantern-court" }],
        fixtures: [],
      },
    },
    characters: {},
  };
}
