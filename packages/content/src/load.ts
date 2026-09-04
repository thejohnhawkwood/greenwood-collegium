import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { roomFileSchema, type RoomFile } from "./schema.js";
import { ContentValidationError, validateWorld, type NamedRoom } from "./validate.js";
import { toWorldState, type LoadedWorld } from "./world.js";

export const bundledRoomsDirectory = fileURLToPath(new URL("../rooms", import.meta.url));

function parseRoomFile(fileName: string, raw: string): RoomFile {
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

  const result = roomFileSchema.safeParse(parsed);
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

export function loadWorldFromDirectory(directory: string): LoadedWorld {
  const fileNames = readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  if (fileNames.length === 0) {
    throw new ContentValidationError([
      {
        code: "no_rooms",
        message: "no room files found",
      },
    ]);
  }

  const namedRooms: NamedRoom[] = fileNames.map((fileName) => ({
    fileName: basename(fileName),
    room: parseRoomFile(fileName, readFileSync(join(directory, fileName), "utf8")),
  }));

  const issues = validateWorld(namedRooms);
  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return toWorldState(namedRooms.map((named) => named.room));
}

export function loadBundledWorld(): LoadedWorld {
  return loadWorldFromDirectory(bundledRoomsDirectory);
}
