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
import { addSaving, deleteSaving, updateSaving } from "@/server/actions/savings"
import { TFetchedSaving } from "@/server/db/savings"
import { SavingSchema, TInsertSaving } from "@/zod/savings"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoreHorizontal, PiggyBank } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"

export default function SavingForm({
    savingTobeEdited
} : {
    savingTobeEdited?: TFetchedSaving
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(savingToDelete: TFetchedSaving) {

        const response = await deleteSaving(savingToDelete.savingId)

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
                {savingTobeEdited ? (
                    <ButtonToEditDeleteSaving setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')} additionalClasses="hidden lg:flex">
                        <PiggyBank />
                        <p>Add Saving Goal</p>
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <p>{savingTobeEdited ? 'Edit Saving Goal' : 'Add Saving Goal'}</p>
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialSavingForm
                            savingTobeEdited={savingTobeEdited}
                            setDialogMode={setDialogMode} 
                        />
                    </>
                )}

                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle><p className="font-bold">{`Deleting '${savingTobeEdited?.savingName}' Saving Goal`}</p></DialogTitle>
                        </DialogHeader>
                        <p>{`${savingTobeEdited?.childTransactionCount} transaction(s) under this goal will be deleted as well.`}</p>
                        <p>{`Are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (savingTobeEdited) {
                                    onDelete(savingTobeEdited)
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

function OfficialSavingForm({
    savingTobeEdited,
    setDialogMode
} : {
    savingTobeEdited?: TFetchedSaving
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertSaving>({
        resolver: zodResolver(SavingSchema),
        defaultValues: savingTobeEdited
        ? {
            savingName: savingTobeEdited.savingName,
            savingDescription: savingTobeEdited.savingDescription,
            savingMonthlyContribution: savingTobeEdited.savingMonthlyContribution,
            savingGoal: savingTobeEdited.savingGoal,
        }
        : {
            savingName: "",
            savingDescription: "",
            savingMonthlyContribution: 0,
            savingGoal: 0,
        }
    })

    const { handleSubmit, control, formState } = form

    async function onSubmit(values: TInsertSaving) {

        const response = savingTobeEdited
            ? await updateSaving(savingTobeEdited.savingId, values)
            : await addSaving(values)

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
                    name="savingName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Saving Name</p></FormLabel>
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
                    name="savingDescription"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Description</p></FormLabel>
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
                    name="savingMonthlyContribution"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Monthly Contribution</p></FormLabel>
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
                    name="savingGoal"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Target Goal</p></FormLabel>
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

                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                            savingTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            savingTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>

            </form>
        </Form>
    )
}

function ButtonToEditDeleteSaving({
    setDialogMode
} : {
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {
    return (
        <div className="absolute right-6 z-10">
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
        </div>
    )
}