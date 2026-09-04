import { z } from "zod";

export const START_ROOM_ID = "lantern-court";

const stableIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9-]*$/, "stable ids must be kebab-case");

const htmlOrScript = /<[a-z/]|javascript:/i;

function rejectMarkup(value: string, label: string, ctx: z.RefinementCtx): void {
  if (htmlOrScript.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be plain text without HTML or scripts`,
    });
  }
}

export const roomExitSchema = z
  .object({
    direction: stableIdSchema,
    toRoomId: stableIdSchema,
  })
  .strict();

export const roomFixtureSchema = z
  .object({
    id: stableIdSchema,
    name: z.string().min(1),
    kind: z.enum(["npc", "object"]),
  })
  .strict()
  .superRefine((fixture, ctx) => {
    rejectMarkup(fixture.name, "fixture name", ctx);
  });

export const roomMapSchema = z
  .object({
    x: z.number().int(),
    y: z.number().int(),
  })
  .strict();

export const roomFileSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    title: z.string().min(1),
    shortDescription: z.string().min(1),
    longDescription: z.string().min(1),
    zone: stableIdSchema,
    exits: z.array(roomExitSchema),
    fixtures: z.array(roomFixtureSchema).default([]),
    map: roomMapSchema.optional(),
    unmapped: z.literal(true).optional(),
    terminal: z.boolean().optional(),
  })
  .strict()
  .superRefine((room, ctx) => {
    rejectMarkup(room.title, "title", ctx);
    rejectMarkup(room.shortDescription, "shortDescription", ctx);
    rejectMarkup(room.longDescription, "longDescription", ctx);

    if (room.map && room.unmapped) {
      ctx.addIssue({
        code: "custom",
        message: "room cannot be both mapped and unmapped",
      });
    }
    if (!room.map && !room.unmapped) {
      ctx.addIssue({
        code: "custom",
        message: "room must include map placement or unmapped",
      });
    }
    if (room.terminal) {
      if (room.exits.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "terminal rooms must not list exits",
        });
      }
    } else if (room.exits.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "room must have at least one exit unless terminal",
      });
    }

    const directions = new Set<string>();
    for (const exit of room.exits) {
      if (directions.has(exit.direction)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate exit direction ${exit.direction}`,
        });
      }
      directions.add(exit.direction);
    }
  });

export type RoomFile = z.infer<typeof roomFileSchema>;
