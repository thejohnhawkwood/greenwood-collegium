import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { z } from "zod";
import { enemyPlacementSchema, enemyTemplateSchema } from "./enemy-schema.js";
import { itemPlacementSchema, itemTemplateSchema } from "./item-schema.js";
import { roomFileSchema } from "./schema.js";
import { spellTemplateSchema } from "./spell-schema.js";
import {
  ContentValidationError,
  validateBestiary,
  validateCatalog,
  validateSpells,
  validateWorld,
  type NamedEnemyPlacement,
  type NamedEnemyTemplate,
  type NamedPlacement,
  type NamedRoom,
  type NamedSpell,
  type NamedTemplate,
} from "./validate.js";
import { toWorldState, type LoadedWorld } from "./world.js";

export const bundledRoomsDirectory = fileURLToPath(new URL("../rooms", import.meta.url));
export const bundledItemsDirectory = fileURLToPath(new URL("../items", import.meta.url));
export const bundledPlacementsDirectory = fileURLToPath(new URL("../placements", import.meta.url));
export const bundledEnemiesDirectory = fileURLToPath(new URL("../enemies", import.meta.url));
export const bundledEnemyPlacementsDirectory = fileURLToPath(
  new URL("../enemy-placements", import.meta.url),
);
export const bundledSpellsDirectory = fileURLToPath(new URL("../spells", import.meta.url));

function parseJsonFile<T>(fileName: string, raw: string, schema: z.ZodType<T>): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ContentValidationError([
      {
        code: "invalid_json",
        message: `${fileName} is not valid JSON`,
        fileName,
      },
    ]);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new ContentValidationError(
      result.error.issues.map((issue) => ({
        code: issue.code,
        message: `${fileName}: ${issue.message}`,
        fileName,
      })),
    );
  }
  return result.data;
}

function listJsonFiles(directory: string): string[] {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));
}

function loadNamedRooms(directory: string): NamedRoom[] {
  const fileNames = listJsonFiles(directory);
  if (fileNames.length === 0) {
    throw new ContentValidationError([
      {
        code: "no_rooms",
        message: "no room files found",
      },
    ]);
  }
  return fileNames.map((fileName) => ({
    fileName: basename(fileName),
    room: parseJsonFile(fileName, readFileSync(join(directory, fileName), "utf8"), roomFileSchema),
  }));
}

function loadNamedTemplates(directory: string): NamedTemplate[] {
  return listJsonFiles(directory).map((fileName) => ({
    fileName: basename(fileName),
    template: parseJsonFile(
      fileName,
      readFileSync(join(directory, fileName), "utf8"),
      itemTemplateSchema,
    ),
  }));
}

function loadNamedPlacements(directory: string): NamedPlacement[] {
  return listJsonFiles(directory).map((fileName) => ({
    fileName: basename(fileName),
    placement: parseJsonFile(
      fileName,
      readFileSync(join(directory, fileName), "utf8"),
      itemPlacementSchema,
    ),
  }));
}

function loadNamedEnemyTemplates(directory: string): NamedEnemyTemplate[] {
  return listJsonFiles(directory).map((fileName) => ({
    fileName: basename(fileName),
    template: parseJsonFile(
      fileName,
      readFileSync(join(directory, fileName), "utf8"),
      enemyTemplateSchema,
    ),
  }));
}

function loadNamedEnemyPlacements(directory: string): NamedEnemyPlacement[] {
  return listJsonFiles(directory).map((fileName) => ({
    fileName: basename(fileName),
    placement: parseJsonFile(
      fileName,
      readFileSync(join(directory, fileName), "utf8"),
      enemyPlacementSchema,
    ),
  }));
}

function loadNamedSpells(directory: string): NamedSpell[] {
  return listJsonFiles(directory).map((fileName) => ({
    fileName: basename(fileName),
    template: parseJsonFile(
      fileName,
      readFileSync(join(directory, fileName), "utf8"),
      spellTemplateSchema,
    ),
  }));
}

export function loadWorldFromDirectory(directory: string): LoadedWorld {
  const namedRooms = loadNamedRooms(directory);
  const issues = validateWorld(namedRooms);
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }
  return toWorldState(namedRooms.map((named) => named.room));
}

export function loadBundledWorld(): LoadedWorld {
  const namedRooms = loadNamedRooms(bundledRoomsDirectory);
  const namedTemplates = loadNamedTemplates(bundledItemsDirectory);
  const namedPlacements = loadNamedPlacements(bundledPlacementsDirectory);
  const namedEnemies = loadNamedEnemyTemplates(bundledEnemiesDirectory);
  const namedEnemyPlacements = loadNamedEnemyPlacements(bundledEnemyPlacementsDirectory);
  const namedSpells = loadNamedSpells(bundledSpellsDirectory);
  const issues = [
    ...validateWorld(namedRooms),
    ...validateCatalog(namedRooms, namedTemplates, namedPlacements),
    ...validateBestiary(namedRooms, namedEnemies, namedEnemyPlacements),
    ...validateSpells(namedSpells),
  ];
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }
  return toWorldState(
    namedRooms.map((named) => named.room),
    {
      templates: namedTemplates.map((named) => named.template),
      placements: namedPlacements.map((named) => named.placement),
      enemies: namedEnemies.map((named) => named.template),
      enemyPlacements: namedEnemyPlacements.map((named) => named.placement),
      spells: namedSpells.map((named) => named.template),
    },
  );
}
