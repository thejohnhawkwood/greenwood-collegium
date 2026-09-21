ALTER TABLE "characters" ADD COLUMN "known_spells" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "characters" ADD COLUMN "pending_primer_choices" jsonb;
ALTER TABLE "characters" ADD COLUMN "primer_awarded_levels" jsonb NOT NULL DEFAULT '[]'::jsonb;
