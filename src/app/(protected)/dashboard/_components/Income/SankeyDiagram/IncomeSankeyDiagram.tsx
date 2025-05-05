"use client"

import { useEffect, useState } from "react"
import { ResponsiveSankey } from "@nivo/sankey"
import { TFetchedIncome } from "@/server/db/income"
import { TFetchedSaving } from "@/server/db/savings"
import { TFetchedBudgetedExpense } from "@/server/db/expenses"
import { calculateTotalFixedExpenses, calculateTotalIncome, calculateTotalSavings, calculateTotalVariableExpenses } from "../IncomeInsights/IncomeInsights"


type TSankeyNode = {
    id: string
    categoryType?: "income" | "saving" | "fixed" | "variable"
} 
type TSankeyLink = {
    source: string
    target: string
    value: number
}
type TSankeyData = {
    nodes: TSankeyNode[]
    links: TSankeyLink[]
}

type TCustomNode = {
    id: string
    parentNode?: string
    nodeIndex?: number
}

export default function IncomeSankeyDiagram({

    allIncome,
    allSavings, 
    allExpensesBudget_Fixed,
    allExpensesBudget_Variable,

} : {

    allIncome: TFetchedIncome[]
    allSavings: TFetchedSaving[]
    allExpensesBudget_Fixed: TFetchedBudgetedExpense[]
    allExpensesBudget_Variable: TFetchedBudgetedExpense[]

}) {

    const totalIncome = calculateTotalIncome(allIncome)
    const totalSavings = calculateTotalSavings(allSavings)
    const totalFixedExpenses = calculateTotalFixedExpenses(allExpensesBudget_Fixed)
    const totalVariableExpenses = calculateTotalVariableExpenses(allExpensesBudget_Variable)

    const [sankeyData, setSankeyData] = useState<TSankeyData>({
        nodes: [
            { id: "Income" },
            { id: "Savings" },
            { id: "Fixed Expenses" },
            { id: "Variable Expenses" },
        ],
        links: [
            { source: "Income", target: "Savings", value: totalSavings },
            { source: "Income", target: "Fixed Expenses", value: totalFixedExpenses },
            { source: "Income", target: "Variable Expenses", value: totalVariableExpenses },
        ],
    })

    useEffect(() => {

        const nodes: TSankeyNode[] = [
            { id: "Income" },
            { id: "Savings" },
            { id: "Fixed Expenses" },
            { id: "Variable Expenses" },
            ...generateIncomeNodes(allIncome),
            ...generateSavingNodes(allSavings),
            ...generateFixedExpensesNodes(allExpensesBudget_Fixed),
            ...generateVariableExpensesNodes(allExpensesBudget_Variable),
        ]
    
        const links: TSankeyLink[] = [
            { source: "Income", target: "Savings", value: totalSavings === 0 ? 1 : totalSavings },
            { source: "Income", target: "Fixed Expenses", value: totalFixedExpenses === 0 ? 1 : totalFixedExpenses },
            { source: "Income", target: "Variable Expenses", value: totalVariableExpenses === 0 ? 1 : totalVariableExpenses},
            ...generateIncomeLinks(allIncome),
            ...generateSavingLinks(allSavings),
            ...generateFixedExpensesLinks(allExpensesBudget_Fixed),
            ...generateVariableExpensesLinks(allExpensesBudget_Variable),
        ]
    
        const difference = totalIncome - totalSavings - totalFixedExpenses - totalVariableExpenses
    
        if (difference < 0) {
            nodes.push({ id: "Deficit" })
            links.push({ source: "Deficit", target: "Income", value: Math.abs(difference) })
        } else if (difference > 0) {
            nodes.push({ id: "Unallocated" })
            links.push({ source: "Income", target: "Unallocated", value: difference })
        }
    
        setSankeyData({ nodes, links })
    
    }, [allIncome, allSavings, allExpensesBudget_Fixed, allExpensesBudget_Variable, totalIncome, totalSavings, totalFixedExpenses, totalVariableExpenses])

    const getNodeColor = (node: TSankeyNode) => {

        if (node.categoryType) {
            switch (node.categoryType) {
                case "income":
                    return "#4ade80" // green
                case "saving":
                    return "#60a5fa" // blue
                case "fixed":
                    return "#f87171" // red
                case "variable":
                    return "#f87171" // red
                default:
                    return "#black"
            }
        }

        switch (node.id) {
            case "Income":
                return "#4ade80" // green
            case "Savings":
                return "#60a5fa" // blue
            case "Fixed Expenses":
            case "Variable Expenses":
            case "Deficit":
                return "#f87171" // red
            case "Unallocated":
                return "#fbbf24" // yellow
            default:
                return "black"
        }
    }
    const customNodeSort = (a: TCustomNode, b: TCustomNode) => {
        // Define the order of parent categories
        const parentOrder = {
            Income: 1,
            Savings: 2,
            "Fixed Expenses": 3,
            "Variable Expenses": 4,
        }

        // Get parent nodes from the links
        const aParent = a.parentNode
        const bParent = b.parentNode

        // If both nodes have parents
        if (aParent && bParent) {
            // If parents are different, sort by parent order
            if (aParent !== bParent) {
                return parentOrder[aParent as keyof typeof parentOrder] - parentOrder[bParent as keyof typeof parentOrder]
            }
            // If parents are the same, maintain the order they were added
            return (a.nodeIndex || 0) - (b.nodeIndex || 0)
        }

        // If only one has a parent, the one without parent comes first
        if (aParent) return 1
        if (bParent) return -1

        // If neither has a parent, maintain original order
        return 0
    }

    // console.log("sankeyData", sankeyData)

    return (
        <div className="h-[700px] w-full">
            {sankeyData.nodes.length > 0 && (
                <ResponsiveSankey
                    data={sankeyData}
                    margin={{ top: 50, bottom: 50, left: 20, right: 20 }}
                    colors={getNodeColor}
                    nodeOpacity={1}
                    nodeHoverOthersOpacity={0.35}
                    nodeThickness={20}
                    nodeSpacing={30}
                    nodeBorderWidth={0}
                    linkOpacity={0.5}
                    linkHoverOthersOpacity={0.1}
                    linkContract={3}
                    enableLinkGradient={true}
                    labelPosition="inside"
                    labelOrientation={"horizontal"}
                    labelPadding={10}
                    labelTextColor="black"
                    animate={true}
                    motionConfig="gentle"
                    sort={customNodeSort}
                />
            )}
        </div>
    )
}


function generateIncomeNodes(allIncome: TFetchedIncome[]): TSankeyNode[] {
    return allIncome.length > 0
        ? allIncome.map((income) => {
            return {
                id: income.incomeName,
                categoryType: "income"
            }
        })
        : [
            {
                id: "You have no income",
                categoryType: "income"
            }
        ]
}
function generateIncomeLinks(allIncome: TFetchedIncome[]): TSankeyLink[] {
    return allIncome.length > 0
        ? allIncome.map((income) => {
            return {
                source: income.incomeName,
                target: "Income",
                value: income.incomeMonthlyContribution
            }
        })
        : [{
            source: "You have no income",
            target: "Income",
            value: 3,
        }]
}
function generateSavingNodes(allSavings: TFetchedSaving[]): TSankeyNode[] {
    return allSavings.length > 0
        ? allSavings.map((saving) => {
            return {
                id: saving.savingName,
                categoryType: "saving"
            }
        })
        : [
            {
                id: "You have no savings",
                categoryType: "saving"
            }
        ]
}
function generateSavingLinks(allSavings: TFetchedSaving[]): TSankeyLink[] {
    return allSavings.length > 0
        ? allSavings.map((saving) => {
            return {
                source: "Savings",
                target: saving.savingName,
                value: saving.savingMonthlyContribution
            }
        })
        : [{
            source: "Savings",
            target: "You have no savings",
            value: 1,
        }]
}
function generateFixedExpensesNodes(allExpensesBudget_Fixed: TFetchedBudgetedExpense[]): TSankeyNode[] {
    return allExpensesBudget_Fixed.length > 0
        ? allExpensesBudget_Fixed.map((fixed) => {
            return {
                id: fixed.expenseName,
                categoryType: "fixed"
            }
        })
        : [
            {
                id: "You have no fixed expenses",
                categoryType: "fixed"
            }
        ]
}
function generateFixedExpensesLinks(allExpensesBudget_Fixed: TFetchedBudgetedExpense[]): TSankeyLink[] {
    return allExpensesBudget_Fixed.length > 0
        ? allExpensesBudget_Fixed.map((fixed) => {
            return {
                source: "Fixed Expenses",
                target: fixed.expenseName,
                value: fixed.expenseMonthlyBudget
            }
        })
        : [{
            source: "Fixed Expenses",
            target: "You have no fixed expenses",
            value: 1,
        }]
}
function generateVariableExpensesNodes(allExpensesBudget_Variable: TFetchedBudgetedExpense[]): TSankeyNode[] {
    return allExpensesBudget_Variable.length > 0
        ? allExpensesBudget_Variable.map((variable) => {
            return {
                id: variable.expenseName,
                categoryType: "variable"
            }
        })
        : [
            {
                id: "You have no variable expenses",
                categoryType: "variable"
            }
        ]
}
function generateVariableExpensesLinks(allExpensesBudget_Variable: TFetchedBudgetedExpense[]): TSankeyLink[] {
    return allExpensesBudget_Variable.length > 0
        ? allExpensesBudget_Variable.map((variable) => {
            return {
                source: "Variable Expenses",
                target: variable.expenseName,
                value: variable.expenseMonthlyBudget
            }
        })
        : [{
            source: "Variable Expenses",
            target: "You have no variable expenses",
            value: 1,
        }]
}
