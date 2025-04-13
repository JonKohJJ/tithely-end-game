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
import { addCard, deleteCard, updateCard } from "@/server/actions/cards"
import { TFetchedCard } from "@/server/db/cards"
import { CardSchema, TInsertCard } from "@/zod/cards"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, MoreHorizontal } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"

export default function IncomeForm({
    cardTobeEdited
} : {
    cardTobeEdited?: TFetchedCard
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(cardToDelete: TFetchedCard) {

        const response = await deleteCard(cardToDelete.cardId)

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
                {cardTobeEdited ? (
                    <ButtonToEditDeleteCard setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')} additionalClasses="hidden lg:flex">
                        <CreditCard />
                        <p>Add Card</p>
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <p>{cardTobeEdited ? 'Edit Card' : 'Add Card'}</p>
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialIncomeForm
                            cardTobeEdited={cardTobeEdited}
                            setDialogMode={setDialogMode} 
                        />
                    </>
                )}

                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle><p className="font-bold">{`Deleting '${cardTobeEdited?.cardName}' Card`}</p></DialogTitle>
                        </DialogHeader>
                        <p>{`${cardTobeEdited?.childTransactionCount} transaction(s) will not be deleted, but they will no longer be associated with this card.`}</p>
                        <p>{`Are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (cardTobeEdited) {
                                    onDelete(cardTobeEdited)
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
    cardTobeEdited,
    setDialogMode
} : {
    cardTobeEdited?: TFetchedCard
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertCard>({
        resolver: zodResolver(CardSchema),
        defaultValues: cardTobeEdited 
            ? {
                cardName: cardTobeEdited.cardName,
                cardMinimumSpend: cardTobeEdited.cardMinimumSpend,
                cardMaximumBudget: cardTobeEdited.cardMaximumBudget,
            }
            : {
                cardName: "",
                cardMinimumSpend: 0,
                cardMaximumBudget: 0,
            }
    })

    const { handleSubmit, control, formState } = form

    async function onSubmit(values: TInsertCard) {

        const response = cardTobeEdited
            ? await updateCard(cardTobeEdited.cardId, values)
            : await addCard(values)

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
                    name="cardName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Card Name</p></FormLabel>
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
                    name="cardMinimumSpend"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Minimum Spend</p></FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none" 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="cardMaximumBudget"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Card Budget</p></FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none" 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage className=" col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                        cardTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            cardTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>

            </form>
        </Form>
    )
}

function ButtonToEditDeleteCard({
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