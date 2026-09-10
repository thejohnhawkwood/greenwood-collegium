import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull(),
  role: text("role").notNull(),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const characters = pgTable(
  "characters",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    name: text("name").notNull(),
    speciesId: text("species_id").notNull(),
    gender: text("gender"),
    level: integer("level").notNull(),
    experience: integer("experience").notNull(),
    roomId: text("room_id").notNull(),
    status: text("status").notNull(),
    creationCompletedAt: timestamp("creation_completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("characters_account_id_idx").on(table.accountId),
    uniqueIndex("characters_name_lower_idx").on(sql`lower(${table.name})`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("sessions_account_id_idx").on(table.accountId)],
);

export const invites = pgTable(
  "invites",
  {
    id: text("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    role: text("role").notNull(),
    createdByAccountId: text("created_by_account_id")
      .notNull()
      .references(() => accounts.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    issuedToken: text("issued_token"),
    consumedByAccountId: text("consumed_by_account_id").references(() => accounts.id),
  },
  (table) => [index("invites_created_by_account_id_idx").on(table.createdByAccountId)],
);

export const itemInstances = pgTable(
  "item_instances",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id").notNull(),
    roomId: text("room_id"),
    holderCharacterId: text("holder_character_id").references(() => characters.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("item_instances_holder_character_id_idx").on(table.holderCharacterId),
    index("item_instances_room_id_idx").on(table.roomId),
  ],
);

export const questProgress = pgTable(
  "quest_progress",
  {
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id),
    questId: text("quest_id").notNull(),
    status: text("status").notNull(),
    completedObjectives: text("completed_objectives").notNull(),
    rewardGranted: text("reward_granted").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ name: "quest_progress_pk", columns: [table.characterId, table.questId] }),
    index("quest_progress_character_id_idx").on(table.characterId),
  ],
);

export const chatLog = pgTable(
  "chat_log",
  {
    id: text("id").primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull(),
    characterId: text("character_id").notNull(),
    accountId: text("account_id").references(() => accounts.id),
    username: text("username"),
    characterName: text("character_name").notNull(),
    roomId: text("room_id").notNull(),
    text: text("text").notNull(),
  },
  (table) => [index("chat_log_at_idx").on(table.at)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull(),
    actorAccountId: text("actor_account_id")
      .notNull()
      .references(() => accounts.id),
    actorUsername: text("actor_username").notNull(),
    action: text("action").notNull(),
    targetName: text("target_name"),
    detail: text("detail").notNull(),
  },
  (table) => [index("audit_log_at_idx").on(table.at)],
);
