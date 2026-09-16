ALTER TABLE "characters" ADD COLUMN "discovered_room_ids" jsonb NOT NULL DEFAULT '["lantern-court"]'::jsonb;
UPDATE "characters"
SET "discovered_room_ids" = (
  SELECT jsonb_agg(DISTINCT value)
  FROM jsonb_array_elements_text(jsonb_build_array('lantern-court', "room_id")) AS t(value)
);
