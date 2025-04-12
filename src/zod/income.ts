import { z } from "zod"

export const IncomeSchema = z
    .object({
        incomeName: z.string().min(1).max(20, "Max 20 Characters"),
        incomeMonthlyContribution: z.number().positive(),
    })

export type TInsertIncome = z.infer<typeof IncomeSchema>


