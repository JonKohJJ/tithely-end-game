"use client"

import MyButton from "@/components/MyButton"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast, useToast } from "@/hooks/use-toast"
import { addIncome, deleteIncome, updateIncome } from "@/server/actions/income"
import { TFetchedIncome } from "@/server/db/income"
import { IncomeSchema, TInsertIncome } from "@/zod/income"
import { zodResolver } from "@hookform/resolvers/zod"
import { HandCoins, MoreHorizontal } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"

export default function IncomeForm({
    incomeTobeEdited
} : {
    incomeTobeEdited?: TFetchedIncome
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(incomeToDelete: TFetchedIncome) {

        const response = await deleteIncome(incomeToDelete.incomeId)

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
                {incomeTobeEdited ? (
                    <ButtonToEditDeleteIncome setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')} additionalClasses="hidden lg:flex">
                        <HandCoins />
                        <p>Add Income Stream</p>
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <p>{incomeTobeEdited ? 'Edit Income' : 'Add Income'}</p>
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialIncomeForm
                            incomeTobeEdited={incomeTobeEdited}
                            setDialogMode={setDialogMode} 
                        />
                    </>
                )}

                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle><p className="font-bold">{`Deleting '${incomeTobeEdited?.incomeName}' Income Stream`}</p></DialogTitle>
                        </DialogHeader>
                        <p>{`${incomeTobeEdited?.childTransactionCount} transaction(s) under this stream will be deleted as well.`}</p>
                        <p>{`Are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (incomeTobeEdited) {
                                    onDelete(incomeTobeEdited)
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

function OfficialIncomeForm({
    incomeTobeEdited,
    setDialogMode
} : {
    incomeTobeEdited?: TFetchedIncome
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertIncome>({
        resolver: zodResolver(IncomeSchema),
        defaultValues: incomeTobeEdited
        ? {
            incomeName: incomeTobeEdited.incomeName,
            incomeMonthlyContribution: incomeTobeEdited.incomeMonthlyContribution,
        }
        : {
            incomeName: "",
            incomeMonthlyContribution: 0,
        }
    })

    const { handleSubmit, control, formState } = form

    async function onSubmit(values: TInsertIncome) {

        const response = incomeTobeEdited
            ? await updateIncome(incomeTobeEdited.incomeId, values)
            : await addIncome(values)

        if (response.success) {
            toast({title: "Sucess", description: response.dbResponseMessage})
            setDialogMode(null)
        } else {
            toast({ title: "Error", description: response.dbResponseMessage });
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">

                <FormField
                    control={control}
                    name="incomeName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Income Name</p></FormLabel>
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
                    name="incomeMonthlyContribution"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Monthly Income</p></FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none"
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
                                />
                            </FormControl>
                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />

                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                            incomeTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            incomeTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>

            </form>
        </Form>
    )
}

function ButtonToEditDeleteIncome({
    setDialogMode
} : {
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="!p-0 h-[unset] notactive border-none hidden lg:flex">
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