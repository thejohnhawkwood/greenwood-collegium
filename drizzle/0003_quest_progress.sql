CREATE TABLE "quest_progress" (
	"character_id" text NOT NULL,
	"quest_id" text NOT NULL,
	"status" text NOT NULL,
	"completed_objectives" text NOT NULL,
	"reward_granted" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "quest_progress_pk" PRIMARY KEY ("character_id", "quest_id")
);
--> statement-breakpoint
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "quest_progress_character_id_idx" ON "quest_progress" USING btree ("character_id");
