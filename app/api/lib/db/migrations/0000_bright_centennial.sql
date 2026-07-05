CREATE TYPE "public"."payment_status" AS ENUM('success', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('enabled', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('weekly', 'monthly', 'annually');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'cancelled', 'paused');--> statement-breakpoint
CREATE TABLE "analytics" (
	"date" date NOT NULL,
	"period_type" smallint NOT NULL,
	"total_revenue" numeric(15, 4) NOT NULL,
	"new_users" integer NOT NULL,
	"lost_users" integer NOT NULL,
	"ongoing_subscriptions" integer NOT NULL,
	CONSTRAINT "analytics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "app_api_keys" (
	"secret" text NOT NULL,
	"prefix" text NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"event" text NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_sessions" (
	"app_id" uuid NOT NULL,
	"token" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"logo_url" text,
	"amount" numeric(15, 4),
	"is_email_verified" boolean DEFAULT false,
	"is_2fa_enabled" boolean DEFAULT false,
	"webhook_url" text,
	"settings" json DEFAULT '{}'::json
);
--> statement-breakpoint
CREATE TABLE "app_2fa_codes" (
	"app_id" uuid NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_2fa_secrets" (
	"app_id" uuid NOT NULL,
	"secret" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"app_id" uuid NOT NULL,
	"subscriber_id" bigint NOT NULL,
	"subscription_id" uuid NOT NULL,
	"card_token" text NOT NULL,
	"order_reference" text NOT NULL,
	"amount" numeric(15, 4) NOT NULL,
	"status" "payment_status" NOT NULL,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions_plans" (
	"id" bigint PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"name" text NOT NULL,
	"amount" numeric(15, 4) NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" "plan_status" DEFAULT 'enabled' NOT NULL,
	"type" "plan_type" DEFAULT 'monthly' NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "save_card_confirmation" (
	"order_reference" text NOT NULL,
	"transaction_id" text NOT NULL,
	"subscriber_id" bigint NOT NULL,
	"status" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriber_cards" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"subscriber_id" bigint NOT NULL,
	"tokenized_card" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"brand" text NOT NULL,
	"last4" text NOT NULL,
	"expiry_month" smallint NOT NULL,
	"expiry_year" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "month_check" CHECK ("subscriber_cards"."expiry_month" >= 1 AND "subscriber_cards"."expiry_month" <= 12)
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"subscriber_id" bigint PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"residual_amount" numeric(15, 4) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"subscriber_id" bigint NOT NULL,
	"plan_id" bigint NOT NULL,
	"card_id" uuid NOT NULL,
	"amount" numeric(15, 4) NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "app_api_keys" ADD CONSTRAINT "app_api_keys_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_logs" ADD CONSTRAINT "application_logs_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_2fa_codes" ADD CONSTRAINT "app_2fa_codes_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_2fa_secrets" ADD CONSTRAINT "app_2fa_secrets_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriber_id_subscribers_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("subscriber_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions_plans" ADD CONSTRAINT "subscriptions_plans_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "save_card_confirmation" ADD CONSTRAINT "save_card_confirmation_subscriber_id_subscribers_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("subscriber_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriber_cards" ADD CONSTRAINT "subscriber_cards_subscriber_id_subscribers_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("subscriber_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_app_id_applications_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_subscribers_subscriber_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("subscriber_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_card_id_subscriber_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."subscriber_cards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_api_keys_appId_idx" ON "app_api_keys" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "app_api_keys_prefix_idx" ON "app_api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "app_logs_app_id_idx" ON "application_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "app_logs_event_idx" ON "application_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "app_logs_created_at_idx" ON "application_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_appId_idx" ON "app_sessions" USING btree ("app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apps_email_idx" ON "applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "apps_name_idx" ON "applications" USING btree ("name");--> statement-breakpoint
CREATE INDEX "apps_created_at_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "codes_2fa_appId_idx" ON "app_2fa_codes" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "secrets_2fa_appId_idx" ON "app_2fa_secrets" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "payments_transactionId_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_subscriberId_idx" ON "payments" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "payments_appId_idx" ON "payments" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "plans_appId_idx" ON "subscriptions_plans" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "plans_amount_idx" ON "subscriptions_plans" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "card_confirmation_created_at" ON "save_card_confirmation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscriber_cards_subscriberId_idx" ON "subscriber_cards" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "subscriber_cards_created_at_idx" ON "subscriber_cards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscribers_appId_idx" ON "subscribers" USING btree ("app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_userId_idx" ON "subscribers" USING btree ("app_id","user_id");--> statement-breakpoint
CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscriptions_start_time_idx" ON "subscriptions" USING btree ("start_time");