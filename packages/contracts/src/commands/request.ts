import { z } from "zod";
import { schemaVersion } from "../schema-version.js";

export const interfaceModeSchema = z.enum(["classic", "colour", "hud", "glyph"]);

export const commandRequestSchema = z.object({
  schemaVersion: z.literal(schemaVersion),
  commandId: z.string().min(1),
  raw: z.string().max(200),
  clientTimestamp: z.string().optional(),
  lastSequence: z.number().int().nonnegative(),
  interfaceMode: interfaceModeSchema.default("classic"),
});

export type CommandRequest = z.infer<typeof commandRequestSchema>;
