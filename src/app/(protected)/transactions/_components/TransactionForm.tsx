import { TInsertTransaction, TransactionCreditOrDebitOptions, TransactionSchema, TransactionTypeOptions } from "@/zod/transactions"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { TFetchedAllCategories } from "@/server/db/categories"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { addTransaction, updateTransaction } from "@/server/actions/transactions"
import { TFetchedTransaction } from "@/server/db/transactions"
import MyButton from "@/components/MyButton"

export default function TransactionForm({
    allCategories,
    setIsAdding,
    transactionToBeEdited,
    setEditingRowId,
    addCreditDebit,
    setAddCreditDebit
}: {
    allCategories: TFetchedAllCategories
    setIsAdding: Dispatch<SetStateAction<boolean>>
    transactionToBeEdited?: TFetchedTransaction
    setEditingRowId?: Dispatch<SetStateAction<string | null>>
    addCreditDebit?: "Credit" | "Debit" | null
    setAddCreditDebit?: Dispatch<SetStateAction<"Credit" | "Debit" | null>>
}) {

    const form = useForm<TInsertTransaction>({
        resolver: zodResolver(TransactionSchema),
        defaultValues: transactionToBeEdited
            ? {
                transactionDate: transactionToBeEdited.user_transactions.transactionDate,
                transactionType: transactionToBeEdited.user_transactions.transactionType, 
                transactionCreditOrDebit: transactionToBeEdited.user_transactions.transactionCreditOrDebit,
                transactionCategoryIdFK: transactionToBeEdited.user_categories.categoryId,
                transactionDescription: transactionToBeEdited.user_transactions.transactionDescription,
                transactionAmount: transactionToBeEdited.user_transactions.transactionAmount,
                isClaimable: transactionToBeEdited.user_transactions.isClaimable,
            }
            : { 
                transactionDate: undefined,
                transactionType: undefined, 
                transactionCreditOrDebit: null,
                transactionCategoryIdFK: undefined,
                transactionDescription: "",
                transactionAmount: 0,
                isClaimable: undefined,
            }
    })

    const { handleSubmit, control, formState, watch, setValue } = form
    const selectedTransactionType = watch("transactionType");
    const [CategoryOptions, setCategoryOptions] = useState<TSelectOption[]>([])

    useEffect(() => {
        // This form control is very confusing 

        setCategoryOptions(getCategoryOptions(selectedTransactionType, allCategories))
        
        if (selectedTransactionType !== "Expenses") {
            setValue("transactionCreditOrDebit", null)
            setValue("isClaimable", null)
        }

        if (selectedTransactionType === "Expenses") {
            if (transactionToBeEdited) {
                return
            }
            setValue("isClaimable", false)
        }
    
    }, [selectedTransactionType, setValue, allCategories, transactionToBeEdited])

    // Add Credit or Debit useEffect Hook
    useEffect(() => {
        if (addCreditDebit) {
            setValue("transactionType", "Expenses")
            setValue("transactionCreditOrDebit", addCreditDebit)
        }
    }, [setValue, addCreditDebit])

    async function onSubmit(values: TInsertTransaction) {

        const response = transactionToBeEdited
            ? await updateTransaction(transactionToBeEdited.user_transactions.transactionId, values)
            : await addTransaction(values)

        
        if (response.success) {
            setIsAdding(false)
            if (setEditingRowId) {
                setEditingRowId(null)
            } 
            if (setAddCreditDebit) {
                setAddCreditDebit(null)
            } 
            toast({title: "Sucess", description: response.dbResponseMessage})
        } else {
            toast({ title: "Error", description: response.dbResponseMessage });
        }
    }

    // Calendar Open/Close State
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <div>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 pr-2 py-2">

                    {/* Transaction Date Field */}
                    <div className={`w-[15%]`}>
                        <FormField
                            control={form.control}
                            name="transactionDate"
                            render={({ field }) => {
                                return (
                                    <FormItem className={`flex flex-col`}>
                                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>

                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                                "pl-3 text-left font-normal !border-color-border shadow-none",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        disabled={formState.isSubmitting}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-auto p-0 bg-color-bg border-color-border" align="start">
                                                <Calendar className="calendar"
                                                    mode="single"
                                                    selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            // Adjust for local timezone
                                                            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                                                .toISOString()
                                                                .split("T")[0]
                                                            field.onChange(localDate)
                                                            // Close Calendar
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
                                        <FormMessage className=" col-span-4 text-right text-red-500"/>
                                    </FormItem>
                                )
                            }}
                        />
                    </div>


                    {/* Transaction Type / Expense Method */}
                    <div className={`flex flex-col gap-2 w-[15%]`}>
                        <FormField
                            control={control}
                            name="transactionType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={formState.isSubmitting}
                                        >
                                            <SelectTrigger className="col-span-3 !m-0 !border-color-border shadow-none">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-color-bg border-color-border">
                                                <SelectGroup>
                                                    {TransactionTypeOptions.map(option => (
                                                        <SelectItem key={option} value={option} className="hover:cursor-pointer">{option}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="transactionCreditOrDebit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select
                                            value={field.value || ""}
                                            onValueChange={field.onChange}
                                            disabled={selectedTransactionType !== "Expenses" || formState.isSubmitting}
                                        >
                                            <SelectTrigger className="col-span-3 !m-0 !border-color-border shadow-none">
                                                <SelectValue placeholder="Expense Method" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-color-bg border-color-border">
                                                <SelectGroup>
                                                    {TransactionCreditOrDebitOptions.map(option => (
                                                        <SelectItem key={option} value={option} className="hover:cursor-pointer">{option}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                </FormItem>
                            )}
                        />
                    </div>


                    {/* Transaction Category */}
                    <div className={`w-[15%]`}>
                        <FormField
                            control={control}
                            name="transactionCategoryIdFK"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select
                                            value={field.value}
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
                            )}
                        />
                    </div>


                    {/* Transaction Description */}
                    <div className={`w-[37%]`}> 
                        <FormField
                            control={control}
                            name="transactionDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="Transaction details..."
                                            {...field} 
                                            disabled={formState.isSubmitting}
                                            className="shadow-none border-color-border"
                                        />
                                    </FormControl>
                                    <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                </FormItem>
                            )}
                        />
                    </div>


                    {/* Transaction Amount */}
                    <div className={`flex flex-col gap-2 w-[10%]`}>
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
                                    <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="isClaimable"
                            render={({ field }) => (
                                <FormItem className={`w-full`}>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Checkbox
                                                id="isClaimable"
                                                checked={field.value || false}
                                                disabled={selectedTransactionType !== "Expenses" || formState.isSubmitting}
                                                onCheckedChange={(value) => field.onChange(value)}
                                            />
                                            <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                                                Is Claimable
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage className=" col-span-4 text-right text-red-500"/>  
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className={`w-[8%] flex flex-col gap-2`}>
                        <MyButton type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting
                                ? 
                                    transactionToBeEdited
                                        ? <p>Editing...</p>
                                        : <p>Adding...</p>

                                :   
                                    transactionToBeEdited
                                    ? <p>Edit</p>
                                    : <p>Add</p>
                            }
                        </MyButton>
                        {transactionToBeEdited && 
                            <MyButton onClickFunction={() => setEditingRowId && setEditingRowId(null)}>Close</MyButton>
                        }
                    </div>

                </form>
            </Form>
        </div>
    )
}

function getCategoryOptions(selectedType: string, allCategories: TFetchedAllCategories): TSelectOption[] {

    const validCategoryOptions: TSelectOption[] = []

    allCategories.map(item => {
        if (item.type === selectedType) {
            item.categories.map(cat => {

                validCategoryOptions.push({
                    label: cat.categoryName,
                    value: cat.categoryId
                })
            })
        }
    })

    return validCategoryOptions
}

type TSelectOption = {
    label: string
    value: string
}