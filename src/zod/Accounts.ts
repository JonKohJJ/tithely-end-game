import { z } from "zod"

export const AccountSchema = z
    .object({
        accountName: z.string().min(1, "Required"),
    })

export type TInsertAccount = z.infer<typeof AccountSchema>


