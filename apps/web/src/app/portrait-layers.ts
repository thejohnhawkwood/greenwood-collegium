import {
  resolveAppearance,
  resolveVisualGender,
  type CharacterVisual,
  type VisualGender,
} from "@greenwood/contracts";

export const KNOWN_SPECIES = [
  "mouse",
  "hare",
  "badger",
  "otter",
  "squirrel",
  "mole",
  "hedgehog",
  "fox",
  "stoat",
  "owl",
  "toad",
] as const;

export type KnownSpecies = (typeof KNOWN_SPECIES)[number];

export const SPECIES_FIT = {
  mouse: "small",
  hare: "tall",
  badger: "stocky",
  otter: "medium",
  squirrel: "medium",
  mole: "stocky",
  hedgehog: "stocky",
  fox: "medium",
  stoat: "medium",
  owl: "winged",
  toad: "amphibian",
} as const;

export const RESERVED_DOLL_SLOTS = ["outer", "headwear", "held", "weapon"] as const;

export type PortraitLayer = {
  layer: string;
  src?: string;
};

const ART = "/art/characters";

export function isKnownSpecies(speciesId: string): speciesId is KnownSpecies {
  return (KNOWN_SPECIES as readonly string[]).includes(speciesId);
}

export function bodyArtSrc(
  speciesId: KnownSpecies,
  gender: VisualGender,
  build: "slender" | "rounded" | "sturdy",
): string {
  return `${ART}/bodies/${speciesId}-${gender}-${build}.png`;
}

export function lookArtSrc(
  speciesId: KnownSpecies,
  gender: VisualGender,
  look: "fern" | "indigo" | "russet",
): string {
  return `${ART}/looks/${speciesId}-${gender}-${look}.png`;
}

/** One complete painted look. Build and palette stay live; overlays do not stack. */
export function portraitLayers(visual?: CharacterVisual): PortraitLayer[] {
  if (!visual || !isKnownSpecies(visual.speciesId)) return [];
  const appearance = resolveAppearance(visual.appearance);
  const gender = resolveVisualGender(visual.gender);
  return [
    { layer: "body", src: lookArtSrc(visual.speciesId, gender, appearance.clothing) },
    { layer: "palette" },
    ...RESERVED_DOLL_SLOTS.map((layer) => ({ layer })),
  ];
}

export function roomArtSrc(visualState: string): string {
  return `/art/rooms/${visualState}.png`;
}
