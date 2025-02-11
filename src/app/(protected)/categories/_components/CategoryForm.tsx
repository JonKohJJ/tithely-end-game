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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { CategorySchema, TInsertCategory } from "@/zod/categories";
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { addCategory, deleteCategory, updateCategory } from "@/server/actions/categories"
import { toast, useToast } from "@/hooks/use-toast"
import { TFetchedCategory, TFetchedCategoryWithChildTransactionCount } from "@/server/db/categories"
import MyButton from "@/components/MyButton"


export default function CategoryForm({
    categoryTobeEdited
}: {
    categoryTobeEdited?: TFetchedCategoryWithChildTransactionCount
}) {

    const [dialogMode, setDialogMode] = useState<'AddOrEdit' | 'Delete' | null>(null)

    const [isDeleting, setIsDeleting] = useState(false)

    async function onDelete(categoryToDelete: TFetchedCategory) {

        const response = await deleteCategory(categoryToDelete.categoryId)

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
                {categoryTobeEdited ? (
                    <ButtonToEditDeleteCategory setDialogMode={setDialogMode} />
                ) : (
                    <MyButton onClickFunction={() => setDialogMode('AddOrEdit')}>
                        Add Category
                    </MyButton>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-color-bg border-color-border">
                {dialogMode === 'AddOrEdit' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {categoryTobeEdited ? 'Edit Category' : 'Add Category'}
                            </DialogTitle>
                        </DialogHeader>
                        <OfficialCategoryForm 
                            setDialogMode={setDialogMode} 
                            categoryTobeEdited={categoryTobeEdited} 
                        />
                    </>
                )}

                {dialogMode === 'Delete' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{`Deleting '${categoryTobeEdited?.categoryName}' Category`}</DialogTitle>
                        </DialogHeader>
                        <p>{`There are ${categoryTobeEdited?.childTransactionsCount} transactions under '${categoryTobeEdited?.categoryName}', are you sure?`}</p>
                        <MyButton disabled={isDeleting} additionalClasses="mt-4 w-1/4 ml-auto"
                            onClickFunction={() => {
                                if (categoryTobeEdited) {
                                    onDelete(categoryTobeEdited)
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

function OfficialCategoryForm({
    categoryTobeEdited,
    setDialogMode
} : {
    categoryTobeEdited?: TFetchedCategory
    setDialogMode: Dispatch<SetStateAction<"AddOrEdit" | "Delete" | null>>
}) {

    const { toast } = useToast()

    const form = useForm<TInsertCategory>({
        resolver: zodResolver(CategorySchema),
        defaultValues: categoryTobeEdited 
        ? {
            categoryType: categoryTobeEdited.categoryType,
            categoryName: categoryTobeEdited.categoryName,
            categoryBudget: categoryTobeEdited.categoryBudget,
            expenseMethod: categoryTobeEdited.expenseMethod,
        }
        : {
            categoryType: undefined,
            categoryName: "",
            categoryBudget: 0,
            expenseMethod: null,
        }
    })

    const { handleSubmit, control, formState, watch, setValue } = form

    const CategoryTypeOptions = CategorySchema._def.schema.shape.categoryType.options
    const selectedCategoryType = watch("categoryType");
    const ExpensesMethodOptions = CategorySchema._def.schema.shape.expenseMethod._def.innerType.options

    useEffect(() => {
        if (selectedCategoryType !== "Expenses") {
            setValue("expenseMethod", null)
        }
    }, [selectedCategoryType, setValue])


    async function onSubmit(values: TInsertCategory) {

        const response = categoryTobeEdited
            ? await updateCategory(categoryTobeEdited.categoryId, values)
            : await addCategory(values)

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
                    name="categoryType"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right">Type</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={formState.isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3 !m-0 shadow-none border-color-border">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-color-bg border-color-border">
                                        <SelectGroup>
                                            {CategoryTypeOptions.map(option => (
                                                <SelectItem key={option} value={option} className="hover:cursor-pointer">{option}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="font-bold col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="categoryName"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right">Name</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none" 
                                />
                            </FormControl>
                            <FormMessage className="font-bold col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="categoryBudget"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right">Budget</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    disabled={formState.isSubmitting} 
                                    className="col-span-3 !m-0 border-color-border shadow-none" 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || "")}
                                />
                            </FormControl>
                            <FormMessage className="font-bold col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="expenseMethod"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-x-4">
                            <FormLabel className="text-right">Expense Method</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    disabled={selectedCategoryType !== "Expenses" || formState.isSubmitting}
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
                            <FormMessage className="font-bold col-span-4 text-right text-red-500"/>  
                        </FormItem>
                    )}
                />
                <MyButton type="submit" additionalClasses="mt-4 w-1/4 ml-auto" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                        ? 
                            categoryTobeEdited
                                ? <p>Editing...</p>
                                : <p>Adding...</p>
                        : 
                            categoryTobeEdited
                                ? <p>Edit</p>
                                : <p>Add</p>
                    }
                </MyButton>
            </form>
        </Form>
    )
}

function ButtonToEditDeleteCategory({
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
                <DropdownMenuItem onClick={() => setDialogMode('AddOrEdit')} className="hover:cursor-pointer">Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogMode('Delete')} className="hover:cursor-pointer">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}