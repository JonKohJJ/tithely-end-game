"use client"

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Plus, SwitchCamera, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MyButton from "@/components/MyButton"
import React, { useState } from 'react'
import { TFetchedTransaction } from "@/server/db/transactions"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteBulkTransactions, deleteTransaction } from "@/server/actions/transactions"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { TransactionCreditOrDebitOptions, TransactionTypeOptions } from "@/zod/transaction"
import TransactionForm, { TSelectOption } from "./TransactionForm"

export const LOCAL_STORAGE_PAGESIZE_KEY = "TITHELY_TRANSACTION_DATATABLE_PAGE_SIZE"

type TDataTableProps<TData> = {
    data: TData[]

    incomeDropdownOptions: TSelectOption[]
    savingsDropdownOptions: TSelectOption[]
    expensesDropdownOptions: TSelectOption[]
    accountsDropdownOptions: TSelectOption[]
    cardsDropdownOptions: TSelectOption[]

    canCreateTransaction: boolean
    maxNumberOfTransactions: number | "Unlimited"

    maxNumberOfCards: number
    maxNumberOfAccounts: number
}

export default function AllTransactions({
    data,

    incomeDropdownOptions,
    savingsDropdownOptions,
    expensesDropdownOptions,
    accountsDropdownOptions,
    cardsDropdownOptions,

    canCreateTransaction,
    maxNumberOfTransactions,

    maxNumberOfCards, 
    maxNumberOfAccounts, 

}: TDataTableProps<TFetchedTransaction>) {

    const storedPageSize = Number(localStorage.getItem(LOCAL_STORAGE_PAGESIZE_KEY)) || 10

    // Managed States
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        transactionType: false,
        transactionCreditOrDebit: false,
        transactionIncomeIdFK: false,
        transactionSavingIdFK: false,
        transactionExpenseIdFK: false, 
        transactionCardIdFK: false,
        transactionAccountIdFK: false,
    })
    const [rowSelection, setRowSelection] = useState({})

    // Table Columns (Hidden ones as well)
    const columns: ColumnDef<TFetchedTransaction>[] = [

        // Select
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => {
              if (row.getIsSelected()) {
                selectedTransactions.add(row.original.transactionId)
              } else {
                selectedTransactions.delete(row.original.transactionId)
              }
              return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
              )
            },
            enableSorting: false,
            enableHiding: false,
            size: 30,
        },
      
        // Transaction Date
        {
            accessorKey: "transactionDate",
            header: ({ column }) => {
                return (
                    <div>
                      <DataTableColumnHeader column={column} title="Date" className="fs-caption" />
                    </div>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.original.transactionDate)
                const formatted = date.toDateString()
                return (
                  <div>
                      <p className="line-clamp-1">{formatted}</p>
                  </div>
                )
            },
            enableSorting: false,
            enableHiding: false,
            size: 200,
        },
      
        // Transaction Type - Hidden
        {
            accessorKey: "transactionType",
            accessorFn: (row) => row?.transactionType || "Unknown",
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => {
                const options = TransactionTypeOptions.find(
                  (option) => option === row.original.transactionType
                )
                if (!options) {
                  return null
                }
                return (
                  <div>
                    <span>{options}</span>
                  </div>
                )
            },
            filterFn: (row, _columnId, filterValue) => {
                const transactionType = row.original.transactionType || "";
                return filterValue.length === 0 || filterValue.includes(transactionType);
            },
        },
        // Transaction Credit or Debit - Hidden
        {
            accessorKey: "transactionCreditOrDebit",
            accessorFn: (row) => row?.transactionCreditOrDebit || "Unknown",
            header: "Expense Method",
            cell: ({ row }) => {
                const options = TransactionCreditOrDebitOptions.find(
                  (option) => option === row.original.transactionCreditOrDebit
                )
                return (
                  <div>
                    <span>
                        {options
                            ? options
                            : '-'
                        }
                    </span>
                  </div>
                )
            },
        },
        // Transaction Income - Hidden
        {
            accessorKey: "transactionIncomeIdFK",
            header: "Income",
            accessorFn: (row) => {
                return incomeDropdownOptions.find(income => income.value === row.transactionIncomeIdFK)?.label ?? "Unknown";
            },
            cell: ({ row }) => {
                const incomeLabel = incomeDropdownOptions.find(income => income.value === row.original.transactionIncomeIdFK)?.label ?? "Unknown";
                return (
                <div>
                    <span>{incomeLabel}</span>
                </div>
                )
            },
        },
        // Transaction Savings - Hidden
        {
            accessorKey: "transactionSavingIdFK",
            header: "Savings",
            accessorFn: (row) => {
                return savingsDropdownOptions.find(saving => saving.value === row.transactionSavingIdFK)?.label ?? "Unknown";
            },
            cell: ({ row }) => {
                const savingLabel = savingsDropdownOptions.find(saving => saving.value === row.original.transactionSavingIdFK)?.label ?? "Unknown";
                return (
                <div>
                    <span>{savingLabel}</span>
                </div>
                )
            },
        },
        // Transaction Expense - Hidden
        {
            accessorKey: "transactionExpenseIdFK",
            header: "Income",
            accessorFn: (row) => {
                return expensesDropdownOptions.find(expense => expense.value === row.transactionExpenseIdFK)?.label ?? "Unknown";
            },
            cell: ({ row }) => {
                const expenseLabel = expensesDropdownOptions.find(expense => expense.value === row.original.transactionExpenseIdFK)?.label ?? "Unknown";
                return (
                <div>
                    <span>{expenseLabel}</span>
                </div>
                )
            },
        },
        // Transaction Card - Hidden
        {
            accessorKey: "transactionCardIdFK",
            header: "Card",
            accessorFn: (row) => {
                return cardsDropdownOptions.find(card => card.value === row.transactionCardIdFK)?.label ?? "Unknown";
            },
            cell: ({ row }) => {
                const cardLabel = cardsDropdownOptions.find(card => card.value === row.original.transactionCardIdFK)?.label ?? "Unknown";
                return (
                  <div>
                    <span>{cardLabel}</span>
                  </div>
                )
              },
        },
        // Transaction Account - Hidden
        {
            accessorKey: "transactionAccountIdFK",
            header: "Account",
            accessorFn: (row) => {
                return accountsDropdownOptions.find(account => account.value === row.transactionAccountIdFK)?.label ?? "Unknown";
            },
            cell: ({ row }) => {
                const accountLabel = accountsDropdownOptions.find(account => account.value === row.original.transactionAccountIdFK)?.label ?? "Unknown";
                return (
                    <div>
                        <span>{accountLabel}</span>
                    </div>
                )
                },
        },
    
        // Transaction Description
        {
            accessorKey: "transactionDescription",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Details" className="hidden md:block fs-caption" />
            ),
            cell: ({ row }) => {
      
                const badgesArray: (string | null)[] = []

                badgesArray.push(row.original.transactionType)
                badgesArray.push(row.original.transactionCreditOrDebit)

                badgesArray.push(
                    row.original.transactionCardIdFK
                        ? cardsDropdownOptions.find(card => card.value === row.original.transactionCardIdFK)?.label ?? null
                        : null
                )

                badgesArray.push(
                    row.original.transactionAccountIdFK
                        ? accountsDropdownOptions.find(account => account.value === row.original.transactionAccountIdFK)?.label ?? null
                        : null
                )

                badgesArray.push(
                    row.original.transactionIncomeIdFK
                        ? incomeDropdownOptions.find(income => income.value === row.original.transactionIncomeIdFK)?.label ?? null
                        : null
                )

                badgesArray.push(
                    row.original.transactionSavingIdFK
                        ? savingsDropdownOptions.find(saving => saving.value === row.original.transactionSavingIdFK)?.label ?? null
                        : null
                )

                badgesArray.push(
                    row.original.transactionExpenseIdFK
                        ? expensesDropdownOptions.find(expense => expense.value === row.original.transactionExpenseIdFK)?.label ?? null
                        : null
                )

                
      
                return (
                  <div className="md:flex md:space-x-2 hidden">
                    {badgesArray.map((badge, index) => (
                        badge !== null && 
                          <Badge key={index} className="border-color-text">
                            <p className="line-clamp-1">{badge}</p>
                          </Badge>
                    ))}
                    
                    <span className="truncate">
                      {row.original.transactionDescription}
                    </span>
                  </div>
                )
            },
            filterFn: (row, _columnId, filterValue) => {
                const description = row.original.transactionDescription || "";
                return description.toLowerCase().includes(filterValue.toLowerCase());
            },
            enableSorting: false,
            enableHiding: false,
            size: 1300,
        },
      
        // Transaction Amount
        {
            accessorKey: "transactionAmount",
            header: ({ column }) => {
                return (
                    <DataTableColumnHeader column={column} title="Amount" className="text-right fs-caption" />
                )
            },
            cell: ({ row }) => {
              const amount = row.original.transactionAmount
              const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(amount)
              const isClaimable = row.original.isClaimable
              return ( 
                <div>
                    <span className="flex gap-2 justify-end items-center">
                        {isClaimable && <SwitchCamera className="w-4 h-4" />} 
                        {formatted}
                    </span>
                </div>
              )
            },
            enableSorting: false,
            enableHiding: false,
            size: 100,
        },
      
        // Row Actions
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
        
                return (
                  <DropdownMenu>
    
                      <DropdownMenuTrigger asChild className="!border-0 !shadow-none hidden lg:flex">
                          <Button variant="ghost" className="h-8 w-8 p-0 notactive">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
    
                      <DropdownMenuContent className="bg-color-bg border-color-border">
                          <DropdownMenuItem
                            className="hover:cursor-pointer"
                            onClick={() => {
                              setEditingRowId(row.original.transactionId)
                              setIsAdding(false)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:cursor-pointer"
                            onClick={() => {
                                onDelete(row.original.transactionId)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                      </DropdownMenuContent>
    
                  </DropdownMenu>
                )
            },
            size: 50,
        },
      
    ]

    // Table
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageSize: storedPageSize,
                pageIndex: 0,
            },
        },
    })

    // Managed States
    const [isAdding, setIsAdding] = useState(false)
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [addCreditDebit, setAddCreditDebit] = useState<"Credit" | "Debit" | null>(null)
    const isFiltered = table.getState().columnFilters.length > 0
    const selectedTransactions: Set<string> = new Set()


    return (
        <div className="transaction-data-table flex flex-col gap-4">
    

            {/* Filters Row */}
            <div className="hidden lg:flex lg:justify-between">
    
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="Search transaction details..."
                        value={(table.getColumn("transactionDescription")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("transactionDescription")?.setFilterValue(event.target.value)}
                        className="max-w-[250px] shadow-none border-color-border"
                    />
        
                    {table.getColumn("transactionType") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionType")}
                            title="Type"
                            options={TransactionTypeOptions}
                        />
                    )}
        
                    {table.getColumn("transactionCreditOrDebit") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionCreditOrDebit")}
                            title="Expense Method"
                            options={TransactionCreditOrDebitOptions}
                        />
                    )}

                    {(table.getColumn("transactionIncomeIdFK") && incomeDropdownOptions.length > 0) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionIncomeIdFK")}
                            title="Income"
                            options={incomeDropdownOptions.map(income => income.label )}
                        />
                    )}

                    {(table.getColumn("transactionSavingIdFK") && savingsDropdownOptions.length > 0) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionSavingIdFK")}
                            title="Savings"
                            options={savingsDropdownOptions.map(saving => saving.label )}
                        />
                    )}

                    {(table.getColumn("transactionExpenseIdFK") && expensesDropdownOptions.length > 0) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionExpenseIdFK")}
                            title="Expenses"
                            options={expensesDropdownOptions.map(expense => expense.label )}
                        />
                    )}

                    {(table.getColumn("transactionCardIdFK") && cardsDropdownOptions.length > 0) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionCardIdFK")}
                            title="Card"
                            options={cardsDropdownOptions.map(card => card.label )}
                        />
                    )}

                    {(table.getColumn("transactionAccountIdFK") && accountsDropdownOptions.length > 0) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("transactionAccountIdFK")}
                            title="Account"
                            options={accountsDropdownOptions.map(account => account.label )}
                        />
                    )}
        
                    {isFiltered && (
                    <MyButton
                        onClickFunction={() => table.resetColumnFilters()}
                    >
                        Reset
                        <X />
                    </MyButton>
                    )}
        
                </div>
        
                <div className="flex gap-2 justify-end">
                    {!isAdding
                        ?
                            canCreateTransaction
                                ? <MyButton 
                                    onClickFunction={() => { 
                                        setIsAdding(true)
                                        setEditingRowId(null)
                                    }}
                                    additionalClasses="hidden lg:flex"
                                >
                                    <Plus />
                                    <p>Add</p>
                                </MyButton>
                                : <p>Max {maxNumberOfTransactions} transactions reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                        :
                            <>
                                <MyButton onClickFunction={() => setAddCreditDebit("Credit")}><Plus /> Credit</MyButton>
                                <MyButton onClickFunction={() => setAddCreditDebit("Debit")}><Plus /> Debit</MyButton>
                            </>
                    }
                </div>
    
            </div>
    

            {/* Table Itself */}
            <div className="rounded-md border-color-border border">
                <Table>
        
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) =>   
                            (
                                <TableRow key={headerGroup.id} className="border-color-border">
                                {headerGroup.headers.map((header) => {
                                    return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                            )}
                                    </TableHead>
                                    )
                                })}
                                </TableRow>
                            )
                        )}
                    </TableHeader>
        
                    <TableBody>
                    {
                        isAdding &&
                            <TableRow className="border-color-border">
                                <TableCell colSpan={5} className="!p-4">
                                    <TransactionForm 
                                        incomeDropdownOptions={incomeDropdownOptions}
                                        savingsDropdownOptions={savingsDropdownOptions}
                                        expensesDropdownOptions={expensesDropdownOptions}
                                        accountsDropdownOptions={accountsDropdownOptions}
                                        cardsDropdownOptions={cardsDropdownOptions}

                                        setIsAdding={setIsAdding}
                                        setEditingRowId={setEditingRowId}
                                        addCreditDebit={addCreditDebit}
                                        setAddCreditDebit={setAddCreditDebit}

                                        maxNumberOfCards={maxNumberOfCards}
                                        maxNumberOfAccounts={maxNumberOfAccounts}
                                    />
                                </TableCell>
                            </TableRow>
                    }
        
                    {table.getRowModel().rows?.length
                        ? (
                            table.getRowModel().rows.map((row) => 
                                row.original.transactionId === editingRowId
                                    ? (
                                        <TableRow key={row.id} className="border-color-border">
                                            <TableCell colSpan={5} className="!p-4">
                                                <TransactionForm
                                                    transactionToBeEdited={row.original}

                                                    incomeDropdownOptions={incomeDropdownOptions}
                                                    savingsDropdownOptions={savingsDropdownOptions}
                                                    expensesDropdownOptions={expensesDropdownOptions}
                                                    accountsDropdownOptions={accountsDropdownOptions}
                                                    cardsDropdownOptions={cardsDropdownOptions}

                                                    setIsAdding={setIsAdding}
                                                    setEditingRowId={setEditingRowId}
                                                    addCreditDebit={addCreditDebit}
                                                    setAddCreditDebit={setAddCreditDebit}

                                                    maxNumberOfCards={maxNumberOfCards}
                                                    maxNumberOfAccounts={maxNumberOfAccounts}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="!border-color-border"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell 
                                                    key={cell.id}
                                                    style={{ width: `${cell.column.getSize()}px` }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                            )
                        ) 
                        : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )
                    }
                    </TableBody>
        
                </Table>
            </div>
    

            {/* Table Footer - Pagination & X number of Rows Selected */}
            <div className="fs-caption hidden lg:flex lg:justify-between lg:space-x-2 ">
    
                <div className="flex-1 text-muted-foreground flex gap-2">
                    <span>
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </span>
                    {
                        table.getFilteredSelectedRowModel().rows.length > 0 && 
                            <p className="underline hover:cursor-pointer text-color-text" onClick={() => onBulkDelete(selectedTransactions, table.resetRowSelection)}>
                                Delete {table.getFilteredSelectedRowModel().rows.length} 
                                {table.getFilteredSelectedRowModel().rows.length > 1 ? " transactions" : " transaction"}
                            </p>
                    }
                </div>
        
                <div className="pagination flex gap-8 items-center">
        
                    <div className="flex items-center gap-2">
                        <p>Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                                localStorage.setItem(LOCAL_STORAGE_PAGESIZE_KEY, value)
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] shadow-none border-color-border">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>

                            <SelectContent side="top" className="bg-color-bg border-color-border fs-caption">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="hover:cursor-pointer">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
        
                    <div className="flex items-center justify-center">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
        
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex shadow-none border-color-border"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shadow-none border-color-border"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shadow-none border-color-border"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex shadow-none border-color-border"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight />
                        </Button>
                    </div>
        
                </div>
    
            </div>
    
    
        </div>
    )
}

async function onDelete(transactionId: string) {

  const response = await deleteTransaction(transactionId)

  if (response.success) {
      toast({title: "Sucess", description: response.dbResponseMessage})
  } else {
      toast({ title: "Error", description: response.dbResponseMessage });
  }
}

async function onBulkDelete(
  selectedTransactions: Set<string>,
  resetRowSelection: (defaultState?: boolean) => void
) {

  const response = await deleteBulkTransactions(selectedTransactions)

  if (response.success) {
      resetRowSelection()
      toast({title: "Sucess", description: response.dbResponseMessage})
  } else {
      toast({ title: "Error", description: response.dbResponseMessage });
  }
}