CREATE TABLE "moderation_state" (
  "account_id" text PRIMARY KEY REFERENCES "accounts"("id") ON DELETE CASCADE,
  "value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classroom_settings" (
  "id" text PRIMARY KEY,
  "chat_paused" boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "speech_log" (
  "id" serial PRIMARY KEY,
  "occurred_at" timestamptz NOT NULL,
  "day" text NOT NULL,
  "account_id" text NOT NULL,
  "character_id" text NOT NULL,
  "command_id" text NOT NULL,
  "username" text NOT NULL,
  "character_name" text NOT NULL,
  "invite_reference" text,
  "room_id" text NOT NULL,
  "content" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "speech_log_command_idx" ON "speech_log"("account_id", "command_id");
--> statement-breakpoint
CREATE INDEX "speech_log_day_id_idx" ON "speech_log"("day", "id");
--> statement-breakpoint
CREATE INDEX "speech_log_occurred_at_idx" ON "speech_log"("occurred_at");
