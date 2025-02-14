'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MonthYearFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [month, setMonth] = useState(Number(searchParams.get('month')) || new Date().getMonth() + 1)
  const [year, setYear] = useState(Number(searchParams.get('year')) || new Date().getFullYear())

  useEffect(() => {
    router.push(`?month=${month}&year=${year}`)
  }, [month, year, router])

  return (
    <div className="flex gap-2"> 
      <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
        <SelectTrigger className="w-[120px] shadow-none border-[1px] border-color-text bg-color-text text-color-bg hover:bg-color-bg hover:text-color-text">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className='border-color-border bg-color-bg'>
          <SelectGroup>
            <SelectLabel>Month</SelectLabel>
            {[...Array(12).keys()].map(i => (
              <SelectItem className='hover:cursor-pointer' key={i} value={String(i + 1)}>
                <p>{new Date(0, i).toLocaleString('default', { month: 'long' })}</p>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
        <SelectTrigger className="w-[120px] shadow-none border-[1px] border-color-text bg-color-text text-color-bg hover:bg-color-bg hover:text-color-text">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className='border-color-border bg-color-bg'>
          <SelectGroup>
            <SelectLabel>Year</SelectLabel>
            {[2025, 2026, 2027].map(y => (
              <SelectItem className='hover:cursor-pointer' key={y} value={String(y)}>
                <p>{y}</p>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
