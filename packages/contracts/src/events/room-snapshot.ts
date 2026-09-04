import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const roomExitSchema = z.object({
  direction: z.string().min(1),
  toRoomId: z.string().min(1),
});

export const roomVisibleEntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["player", "npc", "object"]),
});

export const roomSnapshotPayloadSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  zone: z.string().min(1),
  exits: z.array(roomExitSchema),
  visible: z.array(roomVisibleEntitySchema),
});

export type RoomSnapshotPayload = z.infer<typeof roomSnapshotPayloadSchema>;

export const roomSnapshotEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("room.snapshot"),
  roomId: z.string().min(1),
  payload: roomSnapshotPayloadSchema,
});

export type RoomSnapshotEvent = z.infer<typeof roomSnapshotEventSchema>;

export function formatRoomSnapshotText(payload: RoomSnapshotPayload): string {
  const lines: string[] = [payload.title, "", payload.longDescription];

  if (payload.visible.length > 0) {
    lines.push("", "You see:");
    for (const entity of payload.visible) {
      lines.push(`  ${entity.name}`);
    }
  }

  if (payload.exits.length > 0) {
    const directions = payload.exits.map((exit) => exit.direction).join(", ");
    lines.push("", `Exits: ${directions}`);
  }

  return lines.join("\n");
}
