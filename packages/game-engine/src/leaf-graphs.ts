import type { SchoolId } from "./state.js";

export type LeafOutline = "lanceolate" | "compound" | "ovate" | "palmate" | "obovate" | "linear";

export type LeafJoin = "or" | "and";

export type LeafNode = {
  id: string;
  distance: number;
  parents: readonly string[];
  join?: LeafJoin;
};

export type LeafGraph = {
  schoolId: SchoolId;
  title: string;
  mentor: string;
  outline: LeafOutline;
  nodes: readonly LeafNode[];
};

const node = (
  id: string,
  distance: number,
  parents: readonly string[] = [],
  join?: LeafJoin,
): LeafNode => ({
  id,
  distance,
  parents,
  ...(join ? { join } : {}),
});

/** Vein graphs for the six School leaves. Distance is steps from the stem. */
export const LEAF_GRAPHS: Record<SchoolId, LeafGraph> = {
  ember: {
    schoolId: "ember",
    title: "Ember",
    mentor: "Mentor Cinder",
    outline: "lanceolate",
    nodes: [
      node("ember", 0),
      node("cinder-snap", 1, ["ember"]),
      node("hearth-ward", 1, ["ember"]),
      node("heart-fire", 1, ["ember"]),
      node("flame-breath", 2, ["cinder-snap"]),
      node("stoke", 2, ["cinder-snap", "heart-fire"], "or"),
      node("blaze-mantle", 3, ["hearth-ward", "flame-breath"], "and"),
    ],
  },
  thorn: {
    schoolId: "thorn",
    title: "Thorns",
    mentor: "Mentor Briar",
    outline: "compound",
    nodes: [
      node("briar", 0),
      node("bind", 1, ["briar"]),
      node("prune", 1, ["briar"]),
      node("greenstitch", 1, ["briar"]),
      node("thornwall", 2, ["bind", "prune"], "or"),
      node("sap", 2, ["greenstitch"]),
      node("ask-first", 3, ["bind", "greenstitch"], "and"),
    ],
  },
  veil: {
    schoolId: "veil",
    title: "the Veil",
    mentor: "Mentor Mist",
    outline: "ovate",
    nodes: [
      node("shade", 0),
      node("slip", 1, ["shade"]),
      node("after-image", 1, ["shade"]),
      node("quiet-step", 1, ["shade"]),
      node("pale", 2, ["slip"]),
      node("hush", 3, ["after-image", "pale"], "or"),
      node("unname", 4, ["quiet-step", "hush"], "and"),
    ],
  },
  stars: {
    schoolId: "stars",
    title: "Stars",
    mentor: "Mentor Lumen",
    outline: "palmate",
    nodes: [
      node("azimuth", 0),
      node("flare", 1, ["azimuth"]),
      node("transit", 1, ["azimuth"]),
      node("night-eye", 1, ["azimuth"]),
      node("wane", 2, ["flare"]),
      node("chart", 2, ["night-eye"]),
      node("true-north", 3, ["flare", "transit", "chart"], "or"),
    ],
  },
  stone: {
    schoolId: "stone",
    title: "Stone",
    mentor: "Mentor Quern",
    outline: "obovate",
    nodes: [
      node("keystone", 0),
      node("stomp", 1, ["keystone"]),
      node("brace", 1, ["keystone"]),
      node("stillness", 1, ["keystone"]),
      node("quarry", 2, ["stomp"]),
      node("lintel", 2, ["stomp", "brace"], "or"),
      node("buttress", 3, ["lintel", "stillness"], "or"),
    ],
  },
  steel: {
    schoolId: "steel",
    title: "Steel",
    mentor: "Mentor Edge",
    outline: "linear",
    nodes: [
      node("strike", 0),
      node("riposte", 1, ["strike"]),
      node("guard-break", 1, ["strike"]),
      node("ready-steel", 1, ["strike"]),
      node("draw", 2, ["riposte"]),
      node("second-wind", 2, ["ready-steel"]),
      node("oath-edge", 3, ["draw", "guard-break"], "or"),
    ],
  },
};

export function signatureSpellId(schoolId: SchoolId): string {
  return LEAF_GRAPHS[schoolId].nodes.find((entry) => entry.distance === 0)?.id ?? "";
}
