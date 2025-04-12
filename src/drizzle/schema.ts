import { sql } from "drizzle-orm";
import { boolean, check, date, doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date())

  
// Enums

export const TierEnum = pgEnum("subscription_tier_36", ["Free", "Pro Monthly", "Pro Lifetime"])
export const TypeEnum = pgEnum("type_36", ["Income", "Savings", "Expenses"])
export const ExpenseMethodEnum = pgEnum("expense_method_36", ["Fixed", "Variable"])
export const CreditOrDebitEnum = pgEnum("credit_debit_36", ["Credit", "Debit"])


// Tables

export const UserSubscriptionTable = pgTable(
  'user_subscriptions', 
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"),
    tier: TierEnum().notNull(),
    createdAt,
    updatedAt,
  },
).enableRLS() 

export const IncomeTable = pgTable(
  'user_income',
  {
    incomeId: uuid("income_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    incomeName: text("income_name").notNull(),
    incomeMonthlyContribution: doublePrecision("income_monthly_contribution").notNull(),
    createdAt,
    updatedAt,
  }
).enableRLS()

export const SavingsTable = pgTable(
  'user_savings',
  {
    savingId: uuid("saving_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    savingName: text("saving_name").notNull(),
    savingDescription: text("saving_description").notNull(),
    savingMonthlyContribution: doublePrecision("saving_monthly_contribution").notNull(),
    savingGoal: doublePrecision("saving_goal").notNull(),
    createdAt,
    updatedAt,
  }
).enableRLS()

export const ExpensesTable = pgTable(
  'user_expenses',
  {
    expenseId: uuid("expense_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    expenseName: text("expense_name").notNull(),
    expenseMonthlyBudget: doublePrecision("expense_monthly_budget").notNull(),
    expenseMethod: ExpenseMethodEnum("expense_method").notNull(),
    createdAt,
    updatedAt,
  }
).enableRLS()

export const CardsTable = pgTable(
  'user_cards',
  {
    cardId: uuid("card_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    cardName: text("card_name").notNull(),
    cardMinimumSpend: doublePrecision("card_minimum_spend").notNull(),
    cardMaximumBudget: doublePrecision("card_maximum_budget").notNull(),
    createdAt,
    updatedAt,
  },
).enableRLS()

export const AccountsTable = pgTable(
  'user_accounts',
  {
    accountId: uuid("account_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    accountName: text("account_name").notNull(),
    createdAt,
    updatedAt,
  },
).enableRLS()

export const TransactionsTable = pgTable(
  'user_transactions',
  {
    transactionId: uuid("transaction_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),

    transactionDate: date().notNull(),
    transactionType: TypeEnum("transaction_type").notNull(),
    transactionAmount: doublePrecision("transaction_budget").notNull(),
    transactionDescription: text("transaction_description").notNull(),
    transactionCreditOrDebit: CreditOrDebitEnum("transaction_credit_debit"),
    isClaimable: boolean(),

    transactionIncomeIdFK: uuid("transaction_income_id_fk").references(() => IncomeTable.incomeId, {onDelete: 'cascade'}),
    transactionSavingIdFK: uuid("transaction_saving_id_fk").references(() => SavingsTable.savingId, {onDelete: 'cascade'}),
    transactionExpenseIdFK: uuid("transaction_expense_id_fk").references(() => ExpensesTable.expenseId, {onDelete: 'cascade'}),
    transactionCardIdFK: uuid("transaction_card_id_fk").references(() => CardsTable.cardId),
    transactionAccountIdFK: uuid("transaction_account_id_fk").references(() => AccountsTable.accountId),

    createdAt,
    updatedAt,
  },
  (table) => {
    return [
      check("income_requires_income_id", sql`
        ${table.transactionType} != 'Income' OR ${table.transactionIncomeIdFK} IS NOT NULL
      `),
      
      check("income_null_others", sql`
        ${table.transactionType} != 'Income' OR (
          ${table.transactionSavingIdFK} IS NULL AND
          ${table.transactionExpenseIdFK} IS NULL
        )
      `),
      
      check("savings_requires_saving_id", sql`
        ${table.transactionType} != 'Savings' OR ${table.transactionSavingIdFK} IS NOT NULL
      `),
      
      check("savings_null_others", sql`
        ${table.transactionType} != 'Savings' OR (
          ${table.transactionIncomeIdFK} IS NULL AND
          ${table.transactionExpenseIdFK} IS NULL
        )
      `),
      
      check("expenses_requires_expense_fields", sql`
        ${table.transactionType} != 'Expenses' OR (
          ${table.transactionExpenseIdFK} IS NOT NULL AND
          ${table.transactionCreditOrDebit} IS NOT NULL AND
          ${table.isClaimable} IS NOT NULL
        )
      `),
      
      check("expenses_null_others", sql`
        ${table.transactionType} != 'Expenses' OR (
          ${table.transactionIncomeIdFK} IS NULL AND
          ${table.transactionSavingIdFK} IS NULL
        )
      `),
      
      check("income_savings_null_credit_fields", sql`
        ${table.transactionType} IN ('Income', 'Savings') OR (
          ${table.transactionType} = 'Expenses'
        ) AND (
          ${table.transactionCreditOrDebit} IS NOT NULL OR
          ${table.isClaimable} IS NOT NULL
        )
      `),
      
      check("credit_nulls_account", sql`
        ${table.transactionCreditOrDebit} != 'Credit' OR ${table.transactionAccountIdFK} IS NULL
      `),
      
      check("debit_nulls_card", sql`
        ${table.transactionCreditOrDebit} != 'Debit' OR ${table.transactionCardIdFK} IS NULL
      `),
      
    ]
  }
).enableRLS()
