"use client"

import MyButton from "@/components/MyButton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, useToast } from "@/hooks/use-toast"
import { addExpense, deleteExpense, updateExpense } from "@/server/actions/expenses"
import { ExpenseSchema, TInsertExpense } from "@/zod/expenses"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { DollarSign, MoreHorizontal } from "lucide-react"
import { TFetchedBudgetedExpense } from "@/server/db/expenses"

export default function ExpenseForm({
    expenseTobeEdited
} : {
    expenseTobeEdited?: TFetchedBudgetedExpense
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(expenseToDelete: TFetchedBudgetedExpense) {

        const response = await deleteExpense(expenseToDelete.expenseId)

        if (response.success) {
            toast({title: "Sucess", description: response.dbResponseMessage})
            setDialogMode(null)
            setIsDeleting(false)
        } else {
            toast({ title: "Error", description: response.dbResponseMessage });
        }
    }
    
    return (
        <Dialog open={dialogMode !== null} onOpenChange={(isOpen) => !isOpen && setDialogMode(null)}>
            <DialogTrigger asChild>
                {expenseTobeEdited ? (
                    <ButtonToEditDeleteExpense setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')}>
                        <DollarSign />
                        <p>Add Expense</p>
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <p>{expenseTobeEdited ? 'Edit Expense' : 'Add Expense'}</p>
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialExpenseForm
                            expenseTobeEdited={expenseTobeEdited}
                            setDialogMode={setDialogMode} 
                        />
                    </>
                )}
                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle><p className="font-bold">{`Deleting '${expenseTobeEdited?.expenseName}' Expense`}</p></DialogTitle>
                        </DialogHeader>
                        <p>{`${expenseTobeEdited?.childTransactionCount} transaction(s) under this expense will be deleted as well.`}</p>
                        <p>{`Are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (expenseTobeEdited) {
                                    onDelete(expenseTobeEdited)
                                    setIsDeleting(true)
                                }
                            }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </MyButton>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

function OfficialExpenseForm({
    expenseTobeEdited,
    setDialogMode
} : {
    expenseTobeEdited?: TFetchedBudgetedExpense
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertExpense>({
        resolver: zodResolver(ExpenseSchema),
        defaultValues: expenseTobeEdited 
        ? {
            expenseName: expenseTobeEdited.expenseName,
            expenseMonthlyBudget: expenseTobeEdited.expenseMonthlyBudget,
            expenseMethod: expenseTobeEdited.expenseMethod,
        }
        : {
            expenseName: "",
            expenseMonthlyBudget: 0,
            expenseMethod: undefined,
        }
    })

    const { handleSubmit, control, formState } = form

    async function onSubmit(values: TInsertExpense) {

        const response = expenseTobeEdited
            ? await updateExpense(expenseTobeEdited.expenseId, values)
            : await addExpense(values)

        if (response.success) {
            toast({title: "Sucess", description: response.dbResponseMessage})
            setDialogMode(null)
        } else {
            toast({ title: "Error", description: response.dbResponseMessage });
        }

    }

    const ExpensesMethodOptions = ExpenseSchema.shape.expenseMethod.options


    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">

                <FormField
                    control={control}
                    name="expenseName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Expense Name</p></FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none"
                                />
                            </FormControl>
                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="expenseMonthlyBudget"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Monthly Budget</p></FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none"
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || "")}
                                />
                            </FormControl>
                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="expenseMethod"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Expense Method</p></FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    disabled={formState.isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3 !m-0 shadow-none border-color-border">
                                        <SelectValue placeholder="Select Expense Method" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-color-bg border-color-border">
                                        <SelectGroup>
                                            {ExpensesMethodOptions.map(option => (
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


                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                            expenseTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            expenseTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>

            </form>
        </Form>
    )
}

function ButtonToEditDeleteExpense({
    setDialogMode
} : {
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="!p-0 h-[unset] notactive border-none">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-color-bg border-[1px] border-color-border">
                <DropdownMenuItem onClick={() => setDialogMode('AddOrEdit')} className="hover:cursor-pointer"><p className="fs-base">Edit</p></DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogMode('Delete')} className="hover:cursor-pointer"><p className="fs-base">Delete</p></DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}