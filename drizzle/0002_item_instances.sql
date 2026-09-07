CREATE TABLE "item_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"room_id" text,
	"holder_character_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "item_instances_location_xor" CHECK (
		("room_id" IS NOT NULL AND "holder_character_id" IS NULL)
		OR ("room_id" IS NULL AND "holder_character_id" IS NOT NULL)
	)
);
--> statement-breakpoint
ALTER TABLE "item_instances" ADD CONSTRAINT "item_instances_holder_character_id_characters_id_fk" FOREIGN KEY ("holder_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "item_instances_holder_character_id_idx" ON "item_instances" USING btree ("holder_character_id");
--> statement-breakpoint
CREATE INDEX "item_instances_room_id_idx" ON "item_instances" USING btree ("room_id");
