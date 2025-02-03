import { getAllCategories } from "@/server/db/categories"
import CategoryForm from "./CategoryForm"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Currency, LocateFixed, Percent, TrendingUpDown } from "lucide-react"
import { InsightCard } from "@/components/InsightCard"

export default async function CategoryList({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allCategories: TCategoriesData = [];
    let zeroBasedIndicatorString = "";
    let fixedVariableRatioString = "";

    try {
        const result = await getAllCategories(userId)
        allCategories = result.allCategories
        zeroBasedIndicatorString = result.zeroBasedIndicatorString
        fixedVariableRatioString = result.fixedVariableRatioString

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className="category-list flex flex-col gap-8">

                        <div className="insight-cards-container flex gap-4 flex-col lg:flex-row">
                            <InsightCard 
                                title="Zero-Based Indicator" 
                                description="The zero-based indicator tracks your income against savings and expenses, ensuring every dollar is accounted for and allocated." 
                                content={zeroBasedIndicatorString}
                                icon={<Currency className="w-4 h-4 text-neutral-500" />}
                            />
                            <InsightCard 
                                title="Fixed vs Variable Spending" 
                                description="Compare fixed and variable expenses at a glance." 
                                content={fixedVariableRatioString}
                                icon={<Percent className="w-4 h-4 text-neutral-500" />}
                            />
                        </div>

                        <div className="categories-table-container flex gap-4 flex-col lg:flex-row lg:min-h-[400px]">
                            {allCategories.map(eachType => (
                                <Table key={eachType.type} className="category-table flex flex-col p-2 w-full !h-full border-[1px] border-color-border rounded-xl">
                                    
                                    <TableHeader className="w-full flex flex-col">
                                        <TableRow className="!border-b-0 flex">
                                            <TableHead className="w-9/12 flex items-center fs-base font-medium">{eachType.type}</TableHead>
                                            <TableHead className="w-3/12 flex items-center justify-end fs-base font-medium">{eachType.categories.length}</TableHead>
                                        </TableRow>
                                        <TableRow className="border-b-[1px] border-color-border flex">
                                            <TableHead className={`w-9/12 flex items-center font-light fs-caption`}>Category</TableHead>
                                            <TableHead className={`w-3/12 flex items-center justify-end font-light fs-caption`}>Budget</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="flex-1 w-full overflow-y-auto">
                                        {eachType.categories.length > 0
                                            ? (
                                                eachType.categories.map(category => (
                                                    <TableRow key={category.categoryId} className="w-full flex border-b-[1px] border-color-border">
                                                        <TableCell className={`w-9/12 font-medium`}>
                                                            { category.expenseMethod === null
                                                                ? <p className="line-clamp-1">{category.categoryName}</p>
                                                                : category.expenseMethod === "Fixed"
                                                                    ? <span className="flex gap-2 items-center"><LocateFixed className="w-4 h-4" /><p className="line-clamp-1">{category.categoryName}</p></span>
                                                                    : <span className="flex gap-2 items-center"><TrendingUpDown className="w-4 h-4" /><p className="line-clamp-1">{category.categoryName}</p></span> 
                                                            }
                                                        </TableCell>
                                                        <TableCell className={`w-3/12 flex justify-end md:gap-2`}>
                                                            ${category.categoryBudget}
                                                            <div className="hidden md:block">
                                                                <CategoryForm categoryTobeEdited={category} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )
                                            : (
                                                <TableRow className="w-full flex justify-center h-full items-center hover:!bg-transparent">
                                                    <TableCell className={`font-medium`}>You have no {eachType.type.toLowerCase()} categories</TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>

                                    <TableFooter className="w-full flex-shrink-0 border-t-[1px] border-color-border">
                                        <TableRow className="w-full flex !border-0">
                                            <TableCell className={`w-9/12 font-medium`}>Total</TableCell>
                                            <TableCell className={`w-3/12 flex items-center justify-end`}>${eachType.sum}</TableCell>
                                        </TableRow>
                                    </TableFooter>

                                    <TableCaption>
                                        {eachType.type === "Expenses" 
                                            ? <div className="flex gap-4 items-center w-full justify-center">
                                                <p className="flex gap-[5px] items-center fs-caption"><LocateFixed className="w-4 h-4" /> Fixed Expenses</p>
                                                <p className="flex gap-[5px] items-center fs-caption"><TrendingUpDown className="w-4 h-4" /> Variable Expenses</p>
                                            </div>
                                            : <p className="fs-caption">A list of your {eachType.type.toLowerCase()} categories</p>
                                        }
                                    </TableCaption>
                                </Table>
                            ))}
                        </div>

                    </div>
                )
            }
        </>
    )
}

type TCategoriesData = {
    type: "Income" | "Savings" | "Expenses";
    categories: {
        categoryId: string;
        clerkUserId: string;
        categoryName: string;
        categoryBudget: number;
        categoryType: "Income" | "Savings" | "Expenses";
        expenseMethod: "Fixed" | "Variable" | null;
        createdAt: Date;
        childTransactionsCount: number
    }[];
    sum: number;
}[]
