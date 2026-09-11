import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

export const WEAPON_PROFICIENCIES = ["sword", "staff", "sling"] as const;
export type WeaponProficiency = (typeof WEAPON_PROFICIENCIES)[number];

const speciesSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  weaponProficiency: z.enum(WEAPON_PROFICIENCIES),
});

const namesSchema = z.object({
  reserved: z.array(z.string().min(1)),
  suggested: z.array(z.string().min(1)).min(1),
});

const introSchema = z.object({
  narration: z.string().min(1),
});

const SPECIES = speciesSchema.array().parse(
  JSON.parse(
    readFileSync(fileURLToPath(new URL("../character-creation/species.json", import.meta.url)), {
      encoding: "utf8",
    }),
  ),
);

const NAMES = namesSchema.parse(
  JSON.parse(
    readFileSync(fileURLToPath(new URL("../character-creation/names.json", import.meta.url)), {
      encoding: "utf8",
    }),
  ),
);

const INTRO = introSchema.parse(
  JSON.parse(
    readFileSync(fileURLToPath(new URL("../character-creation/intro.json", import.meta.url)), {
      encoding: "utf8",
    }),
  ),
);

const appearancePairSchema = z.object({
  look: z.string().min(1),
  examine: z.string().min(1),
});

const APPEARANCES = z
  .record(z.string(), z.object({ female: appearancePairSchema, male: appearancePairSchema }))
  .parse(
    JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../character-creation/appearances.json", import.meta.url)),
        { encoding: "utf8" },
      ),
    ),
  );

for (const species of SPECIES) {
  if (!APPEARANCES[species.id]) {
    throw new Error(`Missing appearance text for species "${species.id}".`);
  }
}

export const CHARACTER_GENDERS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
] as const;

export type CharacterGenderId = (typeof CHARACTER_GENDERS)[number]["id"];

export function characterCreationIntro(): string {
  return INTRO.narration;
}

export function listSpecies(): ReadonlyArray<{ id: string; name: string }> {
  return SPECIES.map((species) => ({ id: species.id, name: species.name }));
}

export function speciesWeaponProficiency(speciesId: string): WeaponProficiency | undefined {
  return SPECIES.find((species) => species.id === speciesId)?.weaponProficiency;
}

export function speciesProficiencyTable(): Record<string, WeaponProficiency> {
  return Object.fromEntries(
    SPECIES.map((species) => [species.id, species.weaponProficiency]),
  ) as Record<string, WeaponProficiency>;
}

export function speciesName(speciesId: string): string | undefined {
  return SPECIES.find((species) => species.id === speciesId)?.name;
}

export function isKnownSpecies(speciesId: string): boolean {
  return SPECIES.some((species) => species.id === speciesId);
}

export function isKnownGender(gender: string): gender is CharacterGenderId {
  return CHARACTER_GENDERS.some((entry) => entry.id === gender);
}

export function reservedCharacterNames(): readonly string[] {
  return NAMES.reserved;
}

export function suggestedCharacterNames(): readonly string[] {
  return NAMES.suggested;
}

export function formatCharacterName(givenName: string, speciesId: string): string {
  const species = speciesName(speciesId);
  return species ? `${givenName} the ${species}` : givenName;
}

export function describeCollegian(
  speciesId: string,
  gender: string | undefined,
): { look: string; examine: string } {
  if (gender === "female" || gender === "male") {
    const pair = APPEARANCES[speciesId]?.[gender];
    if (pair) {
      return pair;
    }
  }
  const species = speciesName(speciesId) ?? "woodland";
  return {
    look: `A ${species.toLowerCase()} Collegian in academy colors.`,
    examine: `A ${species.toLowerCase()} Collegian in academy colors, standing ready for the next lesson.`,
  };
}
