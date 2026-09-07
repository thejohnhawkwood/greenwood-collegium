import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const speciesSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
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

export const CHARACTER_GENDERS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "nonbinary", label: "Non-binary" },
] as const;

export type CharacterGenderId = (typeof CHARACTER_GENDERS)[number]["id"];

export function characterCreationIntro(): string {
  return INTRO.narration;
}

export function listSpecies(): ReadonlyArray<{ id: string; name: string }> {
  return SPECIES;
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
