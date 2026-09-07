ALTER TABLE "characters" ADD COLUMN "gender" text;
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "creation_completed_at" timestamp with time zone;
--> statement-breakpoint
CREATE UNIQUE INDEX "characters_name_lower_idx" ON "characters" (lower("name"));
