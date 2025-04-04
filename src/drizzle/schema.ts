import { sql } from "drizzle-orm";
import { boolean, check, date, doublePrecision, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date())

export const TierEnum = pgEnum("subscription_tier_30", ["Free", "Pro Monthly", "Pro Lifetime"])

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

export const TypeEnum = pgEnum("type_30", ["Income", "Savings", "Expenses"])
export const ExpenseMethodEnum = pgEnum("expense_method_30", ["Fixed", "Variable"])

export const CategoriesTable = pgTable(
  'user_categories',
  {
    categoryId: uuid("category_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    categoryName: text("category_name").notNull(),
    categoryBudget: doublePrecision("category_budget").notNull(),
    categoryType: TypeEnum("category_type").notNull(),
    expenseMethod: ExpenseMethodEnum("expense_method"),
    savingGoal: doublePrecision("saving_goal"),
    createdAt,
  },
  (table) => {
    return [ 
      check("Category Type is Expense / Value expected", sql`${table.categoryType} != 'Expenses' OR ${table.expenseMethod} IS NOT NULL`),
      check("Category Type is Income / NULL expected", sql`${table.categoryType} != 'Income' OR ${table.expenseMethod} IS NULL`),
      check("Category Type is Savings / NULL expected", sql`${table.categoryType} != 'Savings' OR ${table.expenseMethod} IS NULL`),
      check("Category Type is Savings / Savings goal value expected", sql`${table.categoryType} != 'Savings' OR ${table.savingGoal} IS NOT NULL`),
    ]
  }
).enableRLS()

export const CreditOrDebitEnum = pgEnum("credit_debit_30", ["Credit", "Debit"])

export const TransactionsTable = pgTable(
  'user_transactions',
  {
    transactionId: uuid("transaction_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    transactionDate: date().notNull(),
    transactionType: TypeEnum("transaction_type").notNull(),
    transactionCategoryIdFK: uuid("transaction_category_id_fk").references(() => CategoriesTable.categoryId, {onDelete: 'cascade'}),
    transactionCardIdFK: uuid("transaction_card_id_fk").references(() => CardsTable.cardId),
    transactionAccountIdFK: uuid("transaction_account_id_fk").references(() => AccountsTable.accountId),
    transactionAmount: doublePrecision("transaction_budget").notNull(),
    transactionDescription: text("transaction_description").notNull(),
    transactionCreditOrDebit: CreditOrDebitEnum("transaction_credit_debit"),
    isClaimable: boolean(),
    createdAt,
  },
  (table) => {
    return [ 
      check("Category Type is Expense / Expenses fields (credit or debit and isclaimable) must not be null", sql`${table.transactionType} != 'Expenses' OR ${table.transactionCreditOrDebit} IS NOT NULL AND ${table.isClaimable} IS NOT NULL`),
      check("Category Type is Income / NULL expected for Expenses fields (credit or debit and isclaimable)", sql`${table.transactionType} != 'Income' OR ${table.transactionCreditOrDebit} IS NULL AND ${table.isClaimable} IS NULL`),
      check("Category Type is Savings / NULL expected for Expenses fields (credit or debit and isclaimable)", sql`${table.transactionType} != 'Savings' OR ${table.transactionCreditOrDebit} IS NULL AND ${table.isClaimable} IS NULL`),
    ]
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
    cardCurrentCharge: doublePrecision("card_current_charge").notNull(),
    createdAt,
  },
).enableRLS()

export const AccountsTable = pgTable(
  'user_accounts',
  {
    accountId: uuid("account_id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    accountName: text("account_name").notNull(),
    accountBalance: doublePrecision("account_balance").notNull(),
    createdAt,
  },
).enableRLS()
