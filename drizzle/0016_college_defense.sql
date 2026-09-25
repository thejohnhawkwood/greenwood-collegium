CREATE TABLE IF NOT EXISTS "college_defense" (
	"id" text PRIMARY KEY NOT NULL,
	"phase" text NOT NULL,
	"ends_at" timestamp with time zone,
	"started_by_username" text,
	"updated_at" timestamp with time zone NOT NULL
);
