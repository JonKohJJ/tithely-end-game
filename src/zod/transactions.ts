import { z } from "zod"

export const TransactionSchema = z
    .object({
        transactionDate: z.string().date(),
        transactionType: z.enum(["Income", "Savings", "Expenses"]), 
        transactionCategoryIdFK: z.string().min(1, "Required"),
        transactionAmount: z.number().positive(), 
        transactionDescription: z.string().min(1, "Required").max(100), 

        transactionCreditOrDebit: z.enum(["Credit", "Debit"]).nullable(),
        transactionCardIdFK: z.string().nullable(),
        transactionAccountIdFK: z.string().nullable(),
        isClaimable: z.boolean().nullable(),
    })
    .superRefine((TransactionSchema, ctx) => {
        if ( (TransactionSchema.transactionType === "Savings" || TransactionSchema.transactionType === "Income")) {
            // Validate transactionCreditOrDebit is null
            if (TransactionSchema.transactionCreditOrDebit !== null) {
                ctx.addIssue({
                    code: "custom",
                    message: "Null Expected",
                    path: ["transactionCreditOrDebit"],
                });
            }

            // Validate isClaimable is null
            if (TransactionSchema.isClaimable !== null) {
                ctx.addIssue({
                    code: "custom",
                    message: "Null Expected",
                    path: ["isClaimable"],
                });
            }
        }

        if (TransactionSchema.transactionType === "Expenses") {
            // Validate transactionCreditOrDebit is NOT null
            if (TransactionSchema.transactionCreditOrDebit === null) {
                ctx.addIssue({
                    code: "custom",
                    message: "Required",
                        // "'transactionCreditOrDebit' must be either 'Credit' or 'Debit' when 'transactionType' is 'Expenses'.",
                    path: ["transactionCreditOrDebit"],
                });
            }

            // Validate isClaimable is NOT null
            if (TransactionSchema.isClaimable === null) {
                ctx.addIssue({
                    code: "custom",
                    message: "Required",
                        // "'isClaimable' must NOT be NULL when 'transactionType' is 'Expenses'.",
                    path: ["isClaimable"],
                });
            }
        }
    })

export type TInsertTransaction = z.infer<typeof TransactionSchema>

export const TransactionTypeOptions = TransactionSchema._def.schema.shape.transactionType.options
export const TransactionCreditOrDebitOptions = TransactionSchema._def.schema.shape.transactionCreditOrDebit._def.innerType.options


