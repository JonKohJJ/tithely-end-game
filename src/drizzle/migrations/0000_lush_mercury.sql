CREATE TYPE "public"."credit_debit_36" AS ENUM('Credit', 'Debit');--> statement-breakpoint
CREATE TYPE "public"."expense_method_36" AS ENUM('Fixed', 'Variable');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier_36" AS ENUM('Free', 'Pro Monthly', 'Pro Lifetime');--> statement-breakpoint
CREATE TYPE "public"."type_36" AS ENUM('Income', 'Savings', 'Expenses');--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"account_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_cards" (
	"card_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"card_name" text NOT NULL,
	"card_minimum_spend" double precision NOT NULL,
	"card_maximum_budget" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_expenses" (
	"expense_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"expense_name" text NOT NULL,
	"expense_monthly_budget" double precision NOT NULL,
	"expense_method" "expense_method_36" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_income" (
	"income_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"income_name" text NOT NULL,
	"income_monthly_contribution" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_income" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_savings" (
	"saving_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"saving_name" text NOT NULL,
	"saving_description" text NOT NULL,
	"saving_monthly_contribution" double precision NOT NULL,
	"saving_goal" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_savings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_transactions" (
	"transaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"transactionDate" date NOT NULL,
	"transaction_type" "type_36" NOT NULL,
	"transaction_budget" double precision NOT NULL,
	"transaction_description" text NOT NULL,
	"transaction_credit_debit" "credit_debit_36",
	"isClaimable" boolean,
	"transaction_income_id_fk" uuid,
	"transaction_saving_id_fk" uuid,
	"transaction_expense_id_fk" uuid,
	"transaction_card_id_fk" uuid,
	"transaction_account_id_fk" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "income_requires_income_id" CHECK (
        "user_transactions"."transaction_type" != 'Income' OR "user_transactions"."transaction_income_id_fk" IS NOT NULL
      ),
	CONSTRAINT "income_null_others" CHECK (
        "user_transactions"."transaction_type" != 'Income' OR (
          "user_transactions"."transaction_saving_id_fk" IS NULL AND
          "user_transactions"."transaction_expense_id_fk" IS NULL
        )
      ),
	CONSTRAINT "savings_requires_saving_id" CHECK (
        "user_transactions"."transaction_type" != 'Savings' OR "user_transactions"."transaction_saving_id_fk" IS NOT NULL
      ),
	CONSTRAINT "savings_null_others" CHECK (
        "user_transactions"."transaction_type" != 'Savings' OR (
          "user_transactions"."transaction_income_id_fk" IS NULL AND
          "user_transactions"."transaction_expense_id_fk" IS NULL
        )
      ),
	CONSTRAINT "expenses_requires_expense_fields" CHECK (
        "user_transactions"."transaction_type" != 'Expenses' OR (
          "user_transactions"."transaction_expense_id_fk" IS NOT NULL AND
          "user_transactions"."transaction_credit_debit" IS NOT NULL AND
          "user_transactions"."isClaimable" IS NOT NULL
        )
      ),
	CONSTRAINT "expenses_null_others" CHECK (
        "user_transactions"."transaction_type" != 'Expenses' OR (
          "user_transactions"."transaction_income_id_fk" IS NULL AND
          "user_transactions"."transaction_saving_id_fk" IS NULL
        )
      ),
	CONSTRAINT "income_savings_null_credit_fields" CHECK (
        "user_transactions"."transaction_type" IN ('Income', 'Savings') OR (
          "user_transactions"."transaction_type" = 'Expenses'
        ) AND (
          "user_transactions"."transaction_credit_debit" IS NOT NULL OR
          "user_transactions"."isClaimable" IS NOT NULL
        )
      ),
	CONSTRAINT "credit_nulls_account" CHECK (
        "user_transactions"."transaction_credit_debit" != 'Credit' OR "user_transactions"."transaction_account_id_fk" IS NULL
      ),
	CONSTRAINT "debit_nulls_card" CHECK (
        "user_transactions"."transaction_credit_debit" != 'Debit' OR "user_transactions"."transaction_card_id_fk" IS NULL
      )
);
--> statement-breakpoint
ALTER TABLE "user_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"stripe_subscription_item_id" text,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"tier" "subscription_tier_36" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_income_id_fk_user_income_income_id_fk" FOREIGN KEY ("transaction_income_id_fk") REFERENCES "public"."user_income"("income_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_saving_id_fk_user_savings_saving_id_fk" FOREIGN KEY ("transaction_saving_id_fk") REFERENCES "public"."user_savings"("saving_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_expense_id_fk_user_expenses_expense_id_fk" FOREIGN KEY ("transaction_expense_id_fk") REFERENCES "public"."user_expenses"("expense_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_card_id_fk_user_cards_card_id_fk" FOREIGN KEY ("transaction_card_id_fk") REFERENCES "public"."user_cards"("card_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transaction_account_id_fk_user_accounts_account_id_fk" FOREIGN KEY ("transaction_account_id_fk") REFERENCES "public"."user_accounts"("account_id") ON DELETE no action ON UPDATE no action;