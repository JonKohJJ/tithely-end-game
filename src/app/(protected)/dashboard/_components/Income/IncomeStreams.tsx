import { TFetchedIncome } from '@/server/db/income'
import React from 'react'
import IncomeForm from './IncomeForm'

export default function IncomeStreams({
    allIncome
} : {
    allIncome: TFetchedIncome[]
}) {
    return (
        <div>
            {allIncome.map(income => {
                return (
                    <div key={income.incomeId} className='flex items-center justify-between'>
                        <p>{income.incomeName}</p>
                        <div className="flex items-center gap-2">
                            <p>${income.incomeMonthlyContribution}</p>
                            <IncomeForm incomeTobeEdited={income} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
