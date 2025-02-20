import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Check, Settings2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title: string
  options: string[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {

  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>

      <PopoverTrigger asChild>
        <Button size="sm" className="h-9 shadow-none border border-color-border">

          <Settings2 />

          <p className="fs-caption">{title}</p>

          {selectedValues.size > 0 && (
            <div className="hidden lg:flex">
              <p className="fs-caption">{selectedValues.size}</p>
            </div>
          )}
          
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0 bg-color-bg border-color-border" align="start">
        <Command>

          <CommandList>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option)
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option)
                      } else {
                        selectedValues.add(option)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                    className="hover:cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check />
                    </div>
                    <span>{option}</span>
                    {facets?.get(option) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono">
                        {facets?.get(option)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>

          </CommandList>

        </Command>
      </PopoverContent>

    </Popover>
  )
}