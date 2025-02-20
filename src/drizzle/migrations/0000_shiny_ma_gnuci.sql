CREATE TYPE "public"."credit_debit_27" AS ENUM('Credit', 'Debit');--> statement-breakpoint
CREATE TYPE "public"."expense_type_27" AS ENUM('Fixed', 'Variable');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier_27" AS ENUM('Free', 'Pro Monthly', 'Pro Lifetime');--> statement-breakpoint
CREATE TYPE "public"."type_27" AS ENUM('Income', 'Savings', 'Expenses');--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"account_name" text NOT NULL,
	"account_balance" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_cards" (
	"card_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"card_name" text NOT NULL,
	"card_minimum_spend" double precision NOT NULL,
	"card_current_charge" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"category_name" text NOT NULL,
	"category_budget" double precision NOT NULL,
	"category_type" "type_27" NOT NULL,
	"expense_method" "expense_type_27",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Category Type is Expense / Value expected" CHECK ("user_categories"."category_type" != 'Expenses' OR "user_categories"."expense_method" IS NOT NULL),
	CONSTRAINT "Category Type is Income / NULL expected" CHECK ("user_categories"."category_type" != 'Income' OR "user_categories"."expense_method" IS NULL),
	CONSTRAINT "Category Type is Savings / NULL expected" CHECK ("user_categories"."category_type" != 'Savings' OR "user_categories"."expense_method" IS NULL)
);
--> statement-breakpoint
ALTER TABLE "user_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_transactions" (
	"transaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"transactionDate" date NOT NULL,
	"transaction_type" "type_27" NOT NULL,
	"transaction_category_id_fk" uuid,
	"transaction_card_id_fk" uuid,
	"transaction_account_id_fk" uuid,
	"transaction_budget" double precision NOT NULL,
	"transaction_description" text NOT NULL,
	"transaction_credit_debit" "credit_debit_27",
	"isClaimable" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Category Type is Expense / Expenses fields (credit or debit and isclaimable) must not be null" CHECK ("user_transactions"."transaction_type" != 'Expenses' OR "user_transactions"."transaction_credit_debit" IS NOT NULL AND "user_transactions"."isClaimable" IS NOT NULL),
	CONSTRAINT "Category Type is Income / NULL expected for Expenses fields (credit or debit and isclaimable)" CHECK ("user_transactions"."transaction_type" != 'Income' OR "user_transactions"."transaction_credit_debit" IS NULL AND "user_transactions"."isClaimable" IS NULL),
	CONSTRAINT "Category Type is Savings / NULL expected for Expenses fields (credit or debit and isclaimable)" CHECK ("user_transactions"."transaction_type" != 'Savings' OR "user_transactions"."transaction_credit_debit" IS NULL AND "user_transactions"."isClaimable" IS NULL)
);
--> statement-breakpoint
ALTER TABLE "user_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"stripe_subscription_item_id" text,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"tier" "subscription_tier_27" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_category_id_fk_user_categories_category_id_fk" FOREIGN KEY ("transaction_category_id_fk") REFERENCES "public"."user_categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_card_id_fk_user_cards_card_id_fk" FOREIGN KEY ("transaction_card_id_fk") REFERENCES "public"."user_cards"("card_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_account_id_fk_user_accounts_account_id_fk" FOREIGN KEY ("transaction_account_id_fk") REFERENCES "public"."user_accounts"("account_id") ON DELETE no action ON UPDATE no action;