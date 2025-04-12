import { z } from "zod"

export const ExpenseSchema = z
    .object({
        expenseName: z.string().min(1).max(20, "Max 20 Characters"),
        expenseMonthlyBudget: z.number().positive(),
        expenseMethod: z.enum(["Fixed", "Variable"]),
    })

export type TInsertExpense = z.infer<typeof ExpenseSchema>


