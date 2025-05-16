import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TInsertNewTransaction, TransactionCreditOrDebitOptions, TransactionSchema, TransactionTypeOptions } from "@/zod/transaction"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import MyButton from "@/components/MyButton"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { format } from "date-fns"
import { addTransaction, updateTransaction } from "@/server/actions/transactions"
import { toast } from "@/hooks/use-toast"
import { TFetchedTransaction } from "@/server/db/transactions"


export type TSelectOption = {
    label: string
    value: string
}

export default function TransactionForm({

    transactionToBeEdited,

    incomeDropdownOptions,
    savingsDropdownOptions,
    expensesDropdownOptions,
    accountsDropdownOptions,
    cardsDropdownOptions,

    setIsAdding,
    setEditingRowId,
    addCreditDebit,
    setAddCreditDebit,

    maxNumberOfCards,
    maxNumberOfAccounts,

} : {

    transactionToBeEdited?: TFetchedTransaction

    incomeDropdownOptions: TSelectOption[]
    savingsDropdownOptions: TSelectOption[]
    expensesDropdownOptions: TSelectOption[]
    accountsDropdownOptions: TSelectOption[]
    cardsDropdownOptions: TSelectOption[]

    setIsAdding: Dispatch<SetStateAction<boolean>>
    setEditingRowId: Dispatch<SetStateAction<string | null>>
    addCreditDebit: "Credit" | "Debit" | null
    setAddCreditDebit: Dispatch<SetStateAction<"Credit" | "Debit" | null>>

    maxNumberOfCards: number
    maxNumberOfAccounts: number

}) {


    const form = useForm<TInsertNewTransaction>({
        resolver: zodResolver(TransactionSchema),
        defaultValues: transactionToBeEdited
        ? {
            transactionDate: transactionToBeEdited.transactionDate,
            transactionType: transactionToBeEdited.transactionType, 
            transactionDescription: transactionToBeEdited.transactionDescription,
            transactionAmount: transactionToBeEdited.transactionAmount,
            // 
            transactionIncomeIdFK:      transactionToBeEdited.transactionIncomeIdFK,
            // 
            transactionSavingIdFK:      transactionToBeEdited.transactionSavingIdFK,
            // 
            transactionExpenseIdFK:     transactionToBeEdited.transactionExpenseIdFK,
            transactionCreditOrDebit:   transactionToBeEdited.transactionCreditOrDebit,
            isClaimable:                transactionToBeEdited.isClaimable,
            // 
            transactionAccountIdFK:     transactionToBeEdited.transactionAccountIdFK,
            // 
            transactionCardIdFK:        transactionToBeEdited.transactionCardIdFK,
        }
        :
        { 
            transactionDate:            "",
            transactionType:            undefined,
            transactionDescription:     "",
            transactionAmount:          0,
            // 
            transactionIncomeIdFK:      null,
            // 
            transactionSavingIdFK:      null,
            // 
            transactionExpenseIdFK:     null,
            transactionCreditOrDebit:   null,
            isClaimable:                null,
            // 
            transactionAccountIdFK:     null,
            // 
            transactionCardIdFK:        null,
        }
    })
    
    const { handleSubmit, control, formState, watch, setValue } = form


    // Managed States
    const [calendarOpen, setCalendarOpen] = useState(false)


    // Watching these fields
    const selectedTransactionType = watch("transactionType")
    const selectedCreditOrDebit = watch("transactionCreditOrDebit")


    // Handle Form Changes
    useEffect(() => {
        if (!transactionToBeEdited) {
            
            if (selectedTransactionType === "Income") {
                setValue("transactionSavingIdFK", null)
                setValue("transactionExpenseIdFK", null)
                setValue("transactionCreditOrDebit", null)
            }

            if (selectedTransactionType === "Savings") {
                setValue("transactionIncomeIdFK", null)
                setValue("transactionExpenseIdFK", null)
                setValue("transactionCreditOrDebit", null)
            }

            if (selectedTransactionType === "Expenses") {
                setValue("transactionIncomeIdFK", null)
                setValue("transactionSavingIdFK", null)
                setValue("isClaimable", false)
            }

            if (selectedCreditOrDebit === "Credit") {
                setValue("transactionAccountIdFK", null)
            }

            if (selectedCreditOrDebit === "Debit") {
                setValue("transactionCardIdFK", null)
            }
        }
    }, [selectedTransactionType, selectedCreditOrDebit, addCreditDebit, transactionToBeEdited, setValue])
    useEffect(() => {
        if (!transactionToBeEdited && addCreditDebit !== null) {
            setValue("transactionType", "Expenses")
            setValue("transactionCreditOrDebit", addCreditDebit)
        }
    }, [addCreditDebit, transactionToBeEdited, setValue])


    // Form Submit
    async function onSubmit(values: TInsertNewTransaction) {

        const response = transactionToBeEdited
            ? await updateTransaction(transactionToBeEdited.transactionId, values)
            : await addTransaction(values)

        
        if (response.success) {

            setIsAdding(false)
            setEditingRowId(null)
            setAddCreditDebit(null)

            toast({title: "Success", description: response.dbResponseMessage})
        } else {
            toast({ title: "Error", description: response.dbResponseMessage });
        }

    }


    return (
        <div className="TransactionForm w-full">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">


                    {/* Date */}
                    <div className="transaction-date w-[13%]">
                        <FormField
                            control={form.control}
                            name="transactionDate"
                            render={({ field }) => (
                                <FormItem>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    disabled={formState.isSubmitting}
                                                    className={cn("w-full text-left font-normal shadow-none !border-color-border", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-color-bg border-color-border" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                                                onSelect={(date) => {
                                                if (date) {
                                                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                                    .toISOString()
                                                    .split("T")[0]
                                                    field.onChange(localDate)
                                                    setCalendarOpen(false)
                                                } else {
                                                    field.onChange("")
                                                }
                                                }}
                                                disabled={(date) => date < new Date("2024-12-31")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                    {/* Type & Expense Method (Credit / Debit) */}
                    <div className="flex flex-col gap-2 w-[15%]">
                        <div className="transaction-type">
                            <FormField
                                control={control}
                                name="transactionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange} disabled={formState.isSubmitting}>
                                            <SelectTrigger className="!border-color-border shadow-none">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-color-bg border-color-border">
                                                <SelectGroup>
                                                    {TransactionTypeOptions.map(option => (
                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {(
                            selectedTransactionType === "Expenses"
                        ) &&
                            <div className="credit-or-debit">
                                <FormField
                                    control={control}
                                    name="transactionCreditOrDebit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select 
                                                    value={field.value || ""} 
                                                    onValueChange={field.onChange}
                                                    disabled={formState.isSubmitting}
                                                >
                                                    <SelectTrigger className="!border-color-border shadow-none">
                                                        <SelectValue placeholder="Expense Method" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-color-bg border-color-border">
                                                        <SelectGroup>
                                                            {TransactionCreditOrDebitOptions.map(option => (
                                                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }
                    </div>


                    {/* Category & Card / Account */}
                    <div className="flex flex-col gap-2 w-[15%]">
                        <div className="income-saving-expense">
                            <FormField
                                control={control}
                                name={
                                    selectedTransactionType === "Income"
                                        ? "transactionIncomeIdFK"
                                        : selectedTransactionType === "Savings"
                                            ? "transactionSavingIdFK"
                                            : "transactionExpenseIdFK"
                                }
                                render={({ field }) => {

                                    const CategoryOptions = selectedTransactionType === "Income"
                                        ? incomeDropdownOptions
                                        : selectedTransactionType === "Savings"
                                            ? savingsDropdownOptions
                                            : expensesDropdownOptions

                                    return (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    value={field.value || undefined}
                                                    onValueChange={field.onChange}
                                                    disabled={formState.isSubmitting}
                                                >
                                                    <SelectTrigger className="!border-color-border shadow-none">
                                                        <SelectValue placeholder="Category" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-color-bg border-color-border">
                                                        <SelectGroup>
                                                            {CategoryOptions.length > 0
                                                                ? (
                                                                    CategoryOptions.map(option => (
                                                                        <SelectItem key={option.value} value={option.value} className="hover:cursor-pointer">{option.label}</SelectItem>
                                                                    ))
                                                                )
                                                                : 
                                                                <p className="p-2">No Categories Found</p>
                                                            }
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>

                        {(
                            selectedTransactionType === "Income" && maxNumberOfAccounts > 0 || 
                            selectedTransactionType === "Savings" && maxNumberOfAccounts > 0 || 
                            (selectedTransactionType === "Expenses" && selectedCreditOrDebit === "Debit" && maxNumberOfAccounts > 0) 
                        ) &&
                            <div className="account">
                                <FormField
                                    control={control}
                                    name="transactionAccountIdFK"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                            <Select 
                                                value={field.value || ""} 
                                                onValueChange={field.onChange}
                                                disabled={formState.isSubmitting}
                                            >
                                                <SelectTrigger className="!border-color-border shadow-none">
                                                <SelectValue placeholder="Accounts" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-color-bg border-color-border">
                                                <SelectGroup>
                                                    {accountsDropdownOptions.length > 0 
                                                        ? accountsDropdownOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                        ))
                                                        : <p className="p-2">No Accounts Found</p>
                                                    }
                                                </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }


                        {(
                            selectedTransactionType === "Expenses" && selectedCreditOrDebit === "Credit" && maxNumberOfCards > 0
                        ) &&
                            <div className="cards">
                                <FormField
                                    control={control}
                                    name="transactionCardIdFK"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                            <Select 
                                                value={field.value || ""} 
                                                onValueChange={field.onChange}
                                                disabled={formState.isSubmitting}
                                            >
                                                <SelectTrigger className="!border-color-border shadow-none">
                                                <SelectValue placeholder="Cards" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-color-bg border-color-border">
                                                <SelectGroup>
                                                    {cardsDropdownOptions.length > 0 
                                                        ? cardsDropdownOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                        ))
                                                        : <p className="p-2">No Cards Found</p>
                                                    }
                                                </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }
                    </div>

                    
                    {/* Description */}
                    <div className="description w-[37%]">
                        <FormField
                            control={control}
                            name="transactionDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Transaction details..." {...field} disabled={formState.isSubmitting} className="shadow-none border-color-border w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    
                    {/* Amount / Is Claimable */}
                    <div className="flex flex-col gap-2 w-[10%]">
                        <div className="amount">
                            <FormField
                                control={control}
                                name="transactionAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter Amount..."
                                                {...field}
                                                disabled={formState.isSubmitting}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value
                                                    if (/^\d*\.?\d{0,2}$/.test(inputValue)) {
                                                        field.onChange(inputValue)
                                                    }
                                                }}
                                                onBlur={() => {
                                                    const value = Number(field.value).toFixed(2)
                                                    field.onChange(Number(value))
                                                }}
                                                className="shadow-none border-color-border"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {(
                            selectedTransactionType === "Expenses"
                        ) && 
                            <div className="is-claimable">
                                <FormField
                                    control={control}
                                    name="isClaimable"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="isClaimable"
                                                    checked={field.value || false}
                                                    disabled={formState.isSubmitting || selectedTransactionType !== "Expenses"}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <label htmlFor="isClaimable" className={formState.isSubmitting ? "text-color-border" : ""}>Is Claimable</label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }
                    </div>

                    
                    {/* Submit / Close Buttons */}
                    <div className="flex flex-col gap-2 w-[10%]">

                        <MyButton type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting
                                ? 
                                    transactionToBeEdited
                                        ? <p>Editing...</p>
                                        : <p>Adding...</p>

                                :   
                                    transactionToBeEdited
                                    ? <p>Edit</p>
                                    : <p> Add</p>
                            }
                        </MyButton>

                        {transactionToBeEdited 
                            ?   
                                <MyButton onClickFunction={() => {
                                    setEditingRowId(null)
                                    setAddCreditDebit(null)
                                }}>
                                    Close
                                </MyButton>
                            : 
                                <MyButton onClickFunction={() => {
                                    setIsAdding(false)
                                    setAddCreditDebit(null)
                                }}>
                                    Close
                                </MyButton>
                        }

                    </div>

                </form>
            </Form>
        </div>
    )
}