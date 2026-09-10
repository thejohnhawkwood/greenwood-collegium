CREATE TABLE "chat_log" (
	"id" text PRIMARY KEY NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"character_id" text NOT NULL,
	"account_id" text,
	"username" text,
	"character_name" text NOT NULL,
	"room_id" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_log" ADD CONSTRAINT "chat_log_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "chat_log_at_idx" ON "chat_log" USING btree ("at");
