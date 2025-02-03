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
        <SelectTrigger className="w-[120px] border-color-border hover:border-color-text">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className='border-color-border bg-color-bg'>
          <SelectGroup>
            <SelectLabel>Month</SelectLabel>
            {[...Array(12).keys()].map(i => (
              <SelectItem className='hover:cursor-pointer' key={i} value={String(i + 1)}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
        <SelectTrigger className="w-[120px] border-color-border hover:border-color-text">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className='border-color-border bg-color-bg'>
          <SelectGroup>
            <SelectLabel>Year</SelectLabel>
            {[2025, 2026, 2027].map(y => (
              <SelectItem className='hover:cursor-pointer hover:font-medium' key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
