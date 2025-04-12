import { z } from "zod"

export const TransactionSchema = z
    .object({

        // Non Null Fields
        transactionDate:            z.string().date(),
        transactionType:            z.enum(["Income", "Savings", "Expenses"]),
        transactionDescription:     z.string().min(1).max(50), 
        transactionAmount:          z.number().positive(),

    
        // When transactionType is INCOME
        // this field CANNOT BE NULL
        transactionIncomeIdFK:      z.string().nullable(),
        

        // When transactionType is SAVINGS
        // this field CANNOT BE NULL
        transactionSavingIdFK:      z.string().nullable(),


        // When transactionType is EXPENSES
        // these fields CANNOT BE NULL
        transactionExpenseIdFK:     z.string().nullable(),
        transactionCreditOrDebit:   z.enum(["Credit", "Debit"]).nullable(),
        isClaimable:                z.boolean().nullable(),


        // When transactionType is INCOME OR SAVINGS
        // OR
        // When transactionCreditOrDebit is DEBIT
        // This field can be null (Users under the free plan can't create an debit account)
        transactionAccountIdFK:     z.string().nullable(),


        // When transactionType is EXPENSES
        // OR
        // When transactionCreditOrDebit is CREDIT
        // This field can be null (Users under the free plan can't create an credit card)
        transactionCardIdFK:        z.string().nullable(),

    })
    .superRefine((data, ctx) => {
      const {
        transactionType,
        transactionIncomeIdFK,
        transactionSavingIdFK,
        transactionExpenseIdFK,
        transactionCreditOrDebit,
        isClaimable,
        transactionAccountIdFK,
        transactionCardIdFK,
      } = data;
    
      // === Income ===
      if (transactionType === "Income") {
        if (!transactionIncomeIdFK) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionIncomeIdFK"],
            message: "Required when transaction type is Income",
          });
        }
        if (transactionSavingIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionSavingIdFK"],
            message: "transactionSavingIdFK must be null when transaction type is Income",
          })
          console.log("transactionSavingIdFK must be null when transaction type is Income")
        }
        if (transactionExpenseIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionExpenseIdFK"],
            message: "transactionExpenseIdFK must be null when transaction type is Income",
          })
          console.log("transactionExpenseIdFK must be null when transaction type is Income")
        }
      }
    
      // === Savings ===
      if (transactionType === "Savings") {
        if (!transactionSavingIdFK) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionSavingIdFK"],
            message: "Required when transaction type is Savings",
          })
        }
        if (transactionIncomeIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionIncomeIdFK"],
            message: "transactionIncomeIdFK must be null when transaction type is Savings",
          })
          console.log("transactionIncomeIdFK must be null when transaction type is Savings")
        }
        if (transactionExpenseIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionExpenseIdFK"],
            message: "transactionExpenseIdFK must be null when transaction type is Savings",
          })
          console.log("transactionExpenseIdFK must be null when transaction type is Savings")
        }
      }
    
      // === Expenses ===
      if (transactionType === "Expenses") {
        if (!transactionExpenseIdFK) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionExpenseIdFK"],
            message: "Required when transaction type is Expenses",
          })
        }
        if (!transactionCreditOrDebit) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionCreditOrDebit"],
            message: "Required when transaction type is Expenses",
          })
        }
        if (isClaimable === null) {
          ctx.addIssue({
            code: "custom",
            path: ["isClaimable"],
            message: "Required when transaction type is Expenses",
          })
        }
        if (transactionIncomeIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionIncomeIdFK"],
            message: "transactionIncomeIdFK must be null when transaction type is Expenses",
          })
          console.log("transactionIncomeIdFK must be null when transaction type is Expenses")
        }
        if (transactionSavingIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionSavingIdFK"],
            message: "transactionSavingIdFK must be null when transaction type is Expenses",
          })
          console.log("transactionSavingIdFK must be null when transaction type is Expenses")
        }
      }

      // === Credit ===
      if (transactionCreditOrDebit === "Credit") {
        if (transactionAccountIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionAccountIdFK"],
            message: "transactionAccountIdFK must be null when transactionCreditOrDebit is Credit",
          })
          console.log("transactionAccountIdFK must be null when transactionCreditOrDebit is Credit")
        }
      }

      // === Debit ===
      if (transactionCreditOrDebit === "Debit") {
        if (transactionCardIdFK !== null) {
          ctx.addIssue({
            code: "custom",
            path: ["transactionCardIdFK"],
            message: "transactionCardIdFK must be null when transactionCreditOrDebit is Debit",
          })
          console.log("transactionCardIdFK must be null when transactionCreditOrDebit is Debit")
        }
      }
    
      // No checks for transactionAccountIdFK and transactionCardIdFK
      // since they are allowed to be null depending on the user's plan
    })
    

export type TInsertNewTransaction = z.infer<typeof TransactionSchema>

export const TransactionTypeOptions = TransactionSchema._def.schema.shape.transactionType.options
export const TransactionCreditOrDebitOptions = TransactionSchema._def.schema.shape.transactionCreditOrDebit._def.innerType.options

      