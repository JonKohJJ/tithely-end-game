import { TFetchedIncome } from '@/server/db/income'
import React from 'react'
import IncomeForm from './IncomeForm'
import { calculateTotalIncome } from '../IncomeInsights/IncomeInsights'

export default function IncomeStreams({
    allIncome
} : {
    allIncome: TFetchedIncome[]
}) {

    const total = calculateTotalIncome(allIncome)

    return (
        <div className="IncomeStreams flex flex-col gap-4 justify-between h-full">

            <div className='flex flex-col gap-2'>
                {allIncome.length > 0 
                    ? allIncome.map(income => {
                        return (
                            <div key={income.incomeId} className='flex items-center justify-between gap-4'>
                                <p>{income.incomeName}</p>
                                <div className="flex items-center gap-2">
                                    <p>${income.incomeMonthlyContribution}</p>
                                    <IncomeForm incomeTobeEdited={income} />
                                </div>
                            </div>
                        )
                    })
                    : <p>No Income Streams</p>
                }
            </div>

            <div className="divider h-[1px] bg-color-border w-full"></div>

            <div className="income-total flex justify-between">
                <p>Total</p>
                <p className='fs-base'>${total}</p>
            </div>
        </div>
    )
}
