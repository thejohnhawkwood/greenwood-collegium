import { z } from "zod";

export const eventTypeSchema = z.enum([
  "system.connected",
  "system.notice",
  "system.error",
  "session.snapshot",
  "room.snapshot",
  "room.entered",
  "room.left",
  "entity.entered",
  "entity.left",
  "chat.said",
  "character.updated",
  "inventory.updated",
  "equipment.updated",
  "item.taken",
  "item.dropped",
  "quest.updated",
  "map.discovered",
  "combat.started",
  "combat.turn_started",
  "combat.action_resolved",
  "combat.status_applied",
  "combat.ended",
  "progress.experience_gained",
  "progress.level_gained",
  "moderation.notice",
]);

export type EventType = z.infer<typeof eventTypeSchema>;

export const eventAudienceSchema = z.enum(["character", "room", "encounter", "system"]);

export type EventAudience = z.infer<typeof eventAudienceSchema>;
