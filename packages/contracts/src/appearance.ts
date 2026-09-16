import { z } from "zod";

/** Cosmetic layers only. Species belongs to the character, never to this profile. */
export const APPEARANCE_BUILDS = ["slender", "rounded", "sturdy"] as const;
export const APPEARANCE_PALETTES = ["chestnut", "ash", "honey", "dusk", "cream"] as const;
export const APPEARANCE_MARKINGS = ["plain", "blaze", "freckles", "mask", "speckled"] as const;
export const APPEARANCE_MUZZLES = ["short", "tapered", "broad"] as const;
export const APPEARANCE_EARS = ["neat", "tufted", "long"] as const;
export const APPEARANCE_FACES = ["bright", "calm", "keen"] as const;
export const APPEARANCE_CLOTHING = ["fern", "indigo", "russet"] as const;
/** Complete painted looks. clothing is the persisted look id. */
export const APPEARANCE_LOOKS = APPEARANCE_CLOTHING;
export type AppearanceLook = (typeof APPEARANCE_LOOKS)[number];
export const APPEARANCE_LOOK_LABELS: Record<AppearanceLook, string> = {
  fern: "Courtyard",
  indigo: "Scriptorium",
  russet: "Road",
};
export const APPEARANCE_LOOK_BLURBS: Record<AppearanceLook, string> = {
  fern: "Moss-green tunic for lantern-court days.",
  indigo: "Indigo scholar robe for the stacks.",
  russet: "Russet cloak and satchel for the road.",
};

export function appearanceLook(value: { clothing?: unknown }): AppearanceLook {
  const parsed = z.enum(APPEARANCE_LOOKS).safeParse(value.clothing);
  return parsed.success ? parsed.data : "fern";
}
export const APPEARANCE_ACCESSORIES = ["none", "scarf", "satchel", "hat"] as const;

export const APPEARANCE_EDITOR_FIELDS = [
  ["build", "Silhouette"],
  ["palette", "Colouring"],
  ["marking", "Markings"],
  ["muzzle", "Muzzle"],
  ["ears", "Ears"],
  ["face", "Expression"],
  ["clothing", "Tunic"],
  ["accessory", "Accessory"],
] as const;

export type AppearanceEditorField = (typeof APPEARANCE_EDITOR_FIELDS)[number][0];

/** Live workshop only tunes what a complete plate can show without stamp overlays. */
export const APPEARANCE_LIVE_FIELDS = [
  ["build", "Silhouette"],
  ["palette", "Colouring"],
] as const;

export const appearanceSchema = z
  .object({
    version: z.literal(2),
    build: z.enum(APPEARANCE_BUILDS),
    palette: z.enum(APPEARANCE_PALETTES),
    marking: z.enum(APPEARANCE_MARKINGS),
    muzzle: z.enum(APPEARANCE_MUZZLES),
    ears: z.enum(APPEARANCE_EARS),
    face: z.enum(APPEARANCE_FACES),
    clothing: z.enum(APPEARANCE_CLOTHING),
    accessory: z.enum(APPEARANCE_ACCESSORIES),
  })
  .strict();

export type Appearance = z.infer<typeof appearanceSchema>;
export const DEFAULT_APPEARANCE: Appearance = {
  version: 2,
  build: "rounded",
  palette: "chestnut",
  marking: "plain",
  muzzle: "tapered",
  ears: "neat",
  face: "bright",
  clothing: "fern",
  accessory: "none",
};

function enumField<K extends AppearanceEditorField>(
  key: K,
  value: unknown,
  fallback: Appearance[K],
): Appearance[K] {
  const parsed = appearanceSchema.shape[key].safeParse(value);
  return (parsed.success ? parsed.data : fallback) as Appearance[K];
}

/** Read-side recovery for v1 saves or unavailable layers; writes use the strict schema. */
export function resolveAppearance(value: unknown): Appearance {
  const raw = z.record(z.string(), z.unknown()).safeParse(value);
  if (!raw.success) return { ...DEFAULT_APPEARANCE };
  const version = raw.data.version;
  if (version !== 1 && version !== 2) return { ...DEFAULT_APPEARANCE };
  return {
    version: 2,
    build: enumField("build", raw.data.build, DEFAULT_APPEARANCE.build),
    palette: enumField("palette", raw.data.palette, DEFAULT_APPEARANCE.palette),
    marking: enumField("marking", raw.data.marking, DEFAULT_APPEARANCE.marking),
    muzzle:
      version === 1
        ? DEFAULT_APPEARANCE.muzzle
        : enumField("muzzle", raw.data.muzzle, DEFAULT_APPEARANCE.muzzle),
    ears:
      version === 1
        ? DEFAULT_APPEARANCE.ears
        : enumField("ears", raw.data.ears, DEFAULT_APPEARANCE.ears),
    face: enumField("face", raw.data.face, DEFAULT_APPEARANCE.face),
    clothing: enumField("clothing", raw.data.clothing, DEFAULT_APPEARANCE.clothing),
    accessory: enumField("accessory", raw.data.accessory, DEFAULT_APPEARANCE.accessory),
  };
}

const FIELD_OPTIONS = {
  build: APPEARANCE_BUILDS,
  palette: APPEARANCE_PALETTES,
  marking: APPEARANCE_MARKINGS,
  muzzle: APPEARANCE_MUZZLES,
  ears: APPEARANCE_EARS,
  face: APPEARANCE_FACES,
  clothing: APPEARANCE_CLOTHING,
  accessory: APPEARANCE_ACCESSORIES,
} as const;

export function appearanceFieldOptions(key: AppearanceEditorField) {
  return FIELD_OPTIONS[key];
}

export function snapAppearanceValue<K extends AppearanceEditorField>(
  key: K,
  index: number,
): Appearance[K] {
  const options = FIELD_OPTIONS[key];
  const clamped = Math.max(0, Math.min(options.length - 1, Math.round(index)));
  return options[clamped] as Appearance[K];
}

export const visualGenderSchema = z.enum(["female", "male"]);
export type VisualGender = z.infer<typeof visualGenderSchema>;

export function resolveVisualGender(value: unknown): VisualGender {
  const parsed = visualGenderSchema.safeParse(value);
  return parsed.success ? parsed.data : "female";
}

export const characterVisualSchema = z.object({
  speciesId: z.string().min(1).max(32),
  gender: visualGenderSchema.optional(),
  appearance: appearanceSchema,
});
export type CharacterVisual = z.infer<typeof characterVisualSchema>;
