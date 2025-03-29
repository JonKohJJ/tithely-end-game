import { z } from "zod"

export const CategorySchema = z
    .object({
        categoryName: z.string().min(1, "Required"),
        categoryBudget: z.number().positive(),
        categoryType: z.enum(["Income", "Savings", "Expenses"]),
        expenseMethod: z.enum(["Fixed", "Variable"]).nullable(),
        savingGoal: z.number().nullable(),
    })
    .superRefine((CategorySchema, ctx) => {
        if (
            (CategorySchema.categoryType === "Savings" || CategorySchema.categoryType === "Income") && 
            CategorySchema.expenseMethod !== null
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Expense Method must be NULL when categoryType is 'Savings' or 'Income'",
                path: ["expenseMethod"]
            })
        }

        if (
            CategorySchema.categoryType === "Expenses" &&
            (CategorySchema.expenseMethod === null || (CategorySchema.expenseMethod !== "Fixed" && CategorySchema.expenseMethod !== "Variable"))
        ) {
            ctx.addIssue({
              code: "custom",
            //   message: "Expense Method must be 'Fixed' or 'Variable' when categoryType is 'Expenses'",
            message: "Required",
              path: ["expenseMethod"]
            })
        }

        if (
            CategorySchema.categoryType === "Savings" && 
            CategorySchema.savingGoal === null
        ) {
            ctx.addIssue({
              code: "custom",
            //   message: "Expense Method must be 'Fixed' or 'Variable' when categoryType is 'Expenses'",
            message: "Saving Goal Required",
              path: ["savingGoal"]
            })
        }
    })

export type TInsertCategory = z.infer<typeof CategorySchema>


