ALTER TABLE "characters" ADD COLUMN "defeated_spawn_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;
