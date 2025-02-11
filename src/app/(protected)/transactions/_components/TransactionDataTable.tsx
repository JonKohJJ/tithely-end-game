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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TransactionTypeOptions, TransactionCreditOrDebitOptions } from "@/zod/transactions"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { TFetchedAllCategories } from "@/server/db/categories"
import TransactionForm from "./TransactionForm"
import { TFetchedTransaction } from "@/server/db/transactions"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Plus, SwitchCamera, X } from "lucide-react"
import { deleteBulkTransactions, deleteTransaction } from "@/server/actions/transactions"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MyButton from "@/components/MyButton"
import Link from "next/link"

type TDataTableProps<TData> = {
  data: TData[]
  allCategories: TFetchedAllCategories
  allCategoryNames: string[]
  canCreate: boolean
}

export const LOCAL_STORAGE_PAGESIZE_KEY = "TITHELY_TRANSACTION_DATATABLE_PAGE_SIZE"

export function TransactionDataTable({
  data,
  allCategories,
  allCategoryNames,
  canCreate
}: TDataTableProps<TFetchedTransaction>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    transactionType: false,
    transactionCreditOrDebit: false, 
    transactionCategory: false, 
  })

  // TODO: Move all these to Context API
  const [rowSelection, setRowSelection] = useState({})
  const [isAdding, setIsAdding] = useState(false)
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [addCreditDebit, setAddCreditDebit] = useState<"Credit" | "Debit" | null>(null)

  const selectedTransactions: Set<string> = new Set()

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
            selectedTransactions.add(row.original.user_transactions.transactionId)
          } else {
            selectedTransactions.delete(row.original.user_transactions.transactionId)
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
        size: 50,
    },
  
    // Transaction Date
    {
        accessorKey: "transactionDate",
        header: ({ column }) => {
            return (
                <div>
                  <DataTableColumnHeader column={column} title="Date" />
                </div>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.user_transactions.transactionDate)
            const formatted = date.toDateString()
            return (
              <div>
                  <p className="line-clamp-1 !p-0">{formatted}</p>
              </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 180,
    },
  
    // Transaction Type - Hidden
    {
        accessorKey: "transactionType",
        accessorFn: (row) => row.user_transactions?.transactionType || "Unknown",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const options = TransactionTypeOptions.find(
              (option) => option === row.original.user_transactions.transactionType
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
            const transactionType = row.original.user_transactions.transactionType || "";
            return filterValue.length === 0 || filterValue.includes(transactionType);
        },
    },
    // Transaction Credit or Debit - Hidden
    {
        accessorKey: "transactionCreditOrDebit",
        accessorFn: (row) => row.user_transactions?.transactionCreditOrDebit || "Unknown",
        header: "Expense Method",
        cell: ({ row }) => {
            const options = TransactionCreditOrDebitOptions.find(
              (option) => option === row.original.user_transactions.transactionCreditOrDebit
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
    // Transaction Category - Hidden
    {
        accessorKey: "transactionCategory",
        accessorFn: (row) => row.user_categories?.categoryName || "Unknown",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.user_categories.categoryName
            return (
              <div>
                <span>{category}</span>
              </div>
            )
        },
    },
  
    // Transaction Description
    {
        accessorKey: "transactionDescription",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Details" className="hidden md:block" />
        ),
        cell: ({ row }) => {
  
            const badgesArray: (string | null)[] = []
            badgesArray.push(row.original.user_transactions.transactionType)
            badgesArray.push(row.original.user_transactions.transactionCreditOrDebit)
            badgesArray.push(row.original.user_categories.categoryName)
  
            return (
              <div className="md:flex md:space-x-2 hidden">
                {badgesArray.map((badge, index) => (
                    badge !== null && <Badge key={index} className="border-color-border shadow-none"><p className="line-clamp-1">{badge}</p></Badge>
                ))}
                
                <span className="truncate font-medium">
                  {row.original.user_transactions.transactionDescription}
                </span>
              </div>
            )
        },
        filterFn: (row, _columnId, filterValue) => {
            const description = row.original.user_transactions.transactionDescription || "";
            return description.toLowerCase().includes(filterValue.toLowerCase());
        },
        enableSorting: false,
        enableHiding: false,
        size: 1200,
    },
  
    // Transaction Amount
    {
        accessorKey: "transactionAmount",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Amount" className="text-right" />
            )
        },
        cell: ({ row }) => {
          const amount = row.original.user_transactions.transactionAmount
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)
          const isClaimable = row.original.user_transactions.isClaimable
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
            const transaction = row.original.user_transactions
    
            return (
              <DropdownMenu>

                  <DropdownMenuTrigger asChild className="hidden md:flex !border-0 !shadow-none">
                      <Button variant="ghost" className="h-8 w-8 p-0 notactive">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="bg-color-bg border-color-border">
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => {
                          setEditingRowId(transaction.transactionId)
                          setIsAdding(false)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => onDelete(transaction.transactionId)}
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
      rowSelection
    },
  })

  const isFiltered = table.getState().columnFilters.length > 0

  // Get Table Page Size from Local Storage
  useEffect(() => {
    const storedPageSize = localStorage.getItem(LOCAL_STORAGE_PAGESIZE_KEY)
    if (storedPageSize) {
      table.setPageSize(Number(storedPageSize))
    }
  }, [table])



  return (
    <div className="transaction-data-table flex flex-col gap-4">

      {/* Filters Row */}
      <div className="hidden md:flex md:items-center">

        <div className="flex gap-2 w-full items-center">
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

          {table.getColumn("transactionCategory") && (
            <DataTableFacetedFilter
              column={table.getColumn("transactionCategory")}
              title="Category"
              options={allCategoryNames}
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
          {isAdding &&
            <>
              <MyButton onClickFunction={() => setAddCreditDebit("Credit")}><Plus /> Credit</MyButton>
              <MyButton onClickFunction={() => setAddCreditDebit("Debit")}><Plus /> Debit</MyButton>
            </>
          }
          {canCreate
            ? <MyButton 
                onClickFunction={() => { 
                  setIsAdding(!isAdding)
                  setEditingRowId(null)
                }}
              >
                { isAdding ? <X /> : <Plus /> }
              </MyButton>
            : <MyButton>
                <Link href="/subscription">Upgrade to Add Transactions</Link>
              </MyButton>
          }
        </div>

      </div>

      {/* Table Itself */}
      <div className="rounded-xl border-color-border border-[1px]">
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
                  <TableCell colSpan={5}>
                    <TransactionForm 
                      allCategories={allCategories}
                      setIsAdding={setIsAdding}
                      addCreditDebit={addCreditDebit}
                      setAddCreditDebit={setAddCreditDebit}
                    />
                  </TableCell>
                </TableRow>
            }

            {table.getRowModel().rows?.length
              ? (
                table.getRowModel().rows.map((row) => 
                  row.original.user_transactions.transactionId === editingRowId
                  ? (
                    <TableRow key={row.id} className="border-color-border">
                      <TableCell colSpan={5}>
                        <TransactionForm
                          allCategories={allCategories} 
                          setIsAdding={setIsAdding} 
                          transactionToBeEdited={row.original}
                          setEditingRowId={setEditingRowId}
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
                    No results.
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>

        </Table>
      </div>

      {/* Table Footer - Pagination & X number of Rows Selected */}
      <div className="hidden md:flex md:items-center md:justify-end md:space-x-2">

        <div className="flex-1 text-sm text-muted-foreground flex gap-2">
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
          {
            table.getFilteredSelectedRowModel().rows.length > 0 && 
              <p className="underline hover:cursor-pointer text-black" onClick={() => onBulkDelete(selectedTransactions, table.resetRowSelection)}>
                Delete {table.getFilteredSelectedRowModel().rows.length} 
                {table.getFilteredSelectedRowModel().rows.length > 1 ? " transactions" : " transaction"}
              </p>
          }
        </div>

        <div className="pagination flex gap-8 items-center">

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
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
              <SelectContent side="top" className="bg-color-bg border-color-border">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="hover:cursor-pointer">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-sm font-medium">
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
