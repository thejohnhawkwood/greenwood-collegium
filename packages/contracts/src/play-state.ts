import { z } from "zod";
import { characterVisualSchema } from "./appearance.js";
import { roomSnapshotPayloadSchema } from "./events/room-snapshot.js";

export const PLAY_STATE_EVENT = "play-state";

export const mapRoomVisibilitySchema = z.enum(["current", "explored", "unknown"]);
export type MapRoomVisibility = z.infer<typeof mapRoomVisibilitySchema>;

export const mapRoomSchema = z
  .object({
    id: z.string().min(1),
    x: z.number().int(),
    y: z.number().int(),
    state: mapRoomVisibilitySchema,
    title: z.string().min(1).optional(),
  })
  .superRefine((room, ctx) => {
    if (room.state === "unknown" && room.title !== undefined) {
      ctx.addIssue({ code: "custom", message: "unknown map rooms must not include a title" });
    }
    if (room.state !== "unknown" && room.title === undefined) {
      ctx.addIssue({ code: "custom", message: "visible map rooms need a title" });
    }
  });
export type MapRoom = z.infer<typeof mapRoomSchema>;

/** Complete private read model, delivered after persisted game events on the same socket. */
export const playStateSchema = z.object({
  character: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    visual: characterVisualSchema,
    health: z.number().nonnegative(),
    maxHealth: z.number().positive(),
    focus: z.number().nonnegative(),
    maxFocus: z.number().positive(),
    level: z.number().int().positive(),
    experience: z.number().int().nonnegative(),
    inCombat: z.boolean(),
    equipped: z.string().optional(),
  }),
  room: roomSnapshotPayloadSchema,
  minimap: z.object({
    rooms: z.array(mapRoomSchema),
    paths: z.array(z.object({ from: z.string(), to: z.string() })),
  }),
  peers: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        visual: characterVisualSchema,
        roomTitle: z.string().min(1).optional(),
      }),
    )
    .default([]),
  conversation: z
    .object({
      npcId: z.string().min(1),
      npcName: z.string().min(1),
      prompt: z.string().min(1),
      choices: z.array(
        z.object({
          say: z.string().min(1),
          label: z.string().min(1),
        }),
      ),
    })
    .optional(),
  bag: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        equipped: z.boolean(),
        category: z.string().min(1).optional(),
      }),
    )
    .default([]),
  quests: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        status: z.enum(["active", "completed"]),
        steps: z.array(
          z.object({
            id: z.string().min(1),
            label: z.string().min(1),
            done: z.boolean(),
            hint: z.string().min(1).optional(),
          }),
        ),
      }),
    )
    .default([]),
});
export type PlayState = z.infer<typeof playStateSchema>;
