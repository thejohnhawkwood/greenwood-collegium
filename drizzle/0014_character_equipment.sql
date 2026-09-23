ALTER TABLE "characters" ADD COLUMN "equipment" jsonb NOT NULL DEFAULT '{}'::jsonb;
