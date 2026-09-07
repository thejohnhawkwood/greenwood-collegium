ALTER TABLE "invites" ADD COLUMN "issued_token" text;
--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "consumed_by_account_id" text;
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_consumed_by_account_id_accounts_id_fk" FOREIGN KEY ("consumed_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
