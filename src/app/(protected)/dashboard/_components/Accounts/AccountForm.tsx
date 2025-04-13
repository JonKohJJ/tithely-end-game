"use client"

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
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Landmark, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useState } from "react"
import { toast, useToast } from "@/hooks/use-toast"

import MyButton from "@/components/MyButton"
import { TFetchedAccount } from "@/server/db/accounts"
import { AccountSchema, TInsertAccount } from "@/zod/accounts"
import { addAccount, deleteAccount, updateAccount } from "@/server/actions/accounts"


export default function AccountForm({
    accountTobeEdited,
}: {
    accountTobeEdited?: TFetchedAccount
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)

    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(accountToDelete: TFetchedAccount) {

        const response = await deleteAccount(accountToDelete.accountId)

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
                {accountTobeEdited ? (
                    <ButtonToEditDeleteAccount setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')} additionalClasses="hidden lg:flex">
                        <Landmark />
                        <p>Add Account</p>
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                <p>{accountTobeEdited ? 'Edit Account' : 'Add Account'}</p>
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialAccountForm 
                            setDialogMode={setDialogMode} 
                            accountTobeEdited={accountTobeEdited} 
                        />
                    </>
                )}

                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{`Deleting '${accountTobeEdited?.accountName}' Account`}</DialogTitle>
                        </DialogHeader>
                        <p>{`${accountTobeEdited?.childTransactionCount} transaction(s) will not be deleted, but they will no longer be associated with this account.`}</p>
                        <p>{`Are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (accountTobeEdited) {
                                    onDelete(accountTobeEdited)
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
    );
}

function OfficialAccountForm({
    accountTobeEdited,
    setDialogMode
} : {
    accountTobeEdited?: TFetchedAccount
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertAccount>({
        resolver: zodResolver(AccountSchema),
        defaultValues: accountTobeEdited 
        ? {
            accountName: accountTobeEdited.accountName,
        }
        : {
            accountName: "",
        }
    })

    const { handleSubmit, control, formState } = form

    async function onSubmit(values: TInsertAccount) {

        const response = accountTobeEdited
            ? await updateAccount(accountTobeEdited.accountId, values)
            : await addAccount(values)

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
                    name="accountName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right"><p>Account Name</p></FormLabel>
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
                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                        accountTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            accountTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>
            </form>
        </Form>
    )
}

function ButtonToEditDeleteAccount({
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
                <DropdownMenuItem onClick={() => setDialogMode('AddOrEdit')} className="hover:cursor-pointer">Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogMode('Delete')} className="hover:cursor-pointer">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}