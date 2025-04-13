import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TFetchedSaving } from '@/server/db/savings'
import { PiggyBank } from 'lucide-react'
import SavingForm from './SavingForm'

export default function SavingsGoals({
    allSavings,
    maxNumberOfSavings,
} : {
    allSavings: TFetchedSaving[]
    maxNumberOfSavings: number
}) {

    return (
        <div className='flex flex-col gap-4'>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                {allSavings.map((saving, index) => {

                    const percentage = (saving.totalSavedAmount / saving.savingGoal) * 100
                    const savingBreakdown = generateSavingBreakdown(saving.totalSavedAmount, saving.savingGoal)

                    return (
                        <Card key={index} className="shadow-none border-color-border">

                            <CardHeader className='relative'>
                                <SavingForm savingTobeEdited={saving} />
                                <ProgressCircle
                                    percentage={percentage}
                                    color={saving.fill}
                                />
                            </CardHeader>

                            <CardContent>
                                <div className="flex flex-col items-center mb-6">
                                    <p className="fs-h3">{saving.savingName}</p>
                                    <p>{saving.savingDescription}</p>
                                </div>

                                <div className="flex items-center justify-center gap-2 fs-h3">
                                    <p>${saving.totalSavedAmount.toLocaleString()}</p>
                                    <p>/</p>
                                    <p>${saving.savingGoal.toLocaleString()}</p>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p>Monthly Contribution: ${saving.savingMonthlyContribution.toLocaleString()}</p>
                                </div>
                            </CardContent>

                            <CardFooter className='text-center'>
                                <p>{savingBreakdown}</p>
                            </CardFooter>

                        </Card>
                    )
                })}

                {Array.from({ length: allSavings.length === 0 ? maxNumberOfSavings : (maxNumberOfSavings - (allSavings.length % maxNumberOfSavings)) % maxNumberOfSavings }).map((_, index) => (
                    <div key={`empty-${index}`} className="w-full h-full border border-dashed border-color-border rounded-xl min-h-[500px]" />
                ))}

            </div>
        </div>
    )
}

function ProgressCircle({ 
    percentage, 
    color
} : {
    percentage: number, 
    color: string,
}) {

    // Calculate circle properties
    const radius = 40
    const circumference = 2 * Math.PI * radius

    // Cap the percentage at 100% for the calculation
    const cappedPercentage = Math.min(percentage, 100)
    const strokeDashoffset = circumference - (cappedPercentage / 100) * circumference
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 120 120">

                {/* Background circle */}
                <circle cx="60" cy="60" r={radius} 
                    fill="none" 
                    stroke="var(--color-muted-text)" 
                    strokeWidth="8"
                />

                {/* Progress circle */}
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ color }}
                    transform="rotate(-90 60 60)"
                />

                {/* Percentage text */}
                {/* <text x="60" y="65" textAnchor="middle" fontSize="18" fontWeight="bold" fill="currentColor">
                    {Math.round(percentage)}%
                </text> */}

            </svg>

            {/* Icon in the center */}
            <div 
                className={`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-full w-[90px] h-[90px] m-auto`}
                style={{ backgroundColor: color }}
            >
                <PiggyBank />
            </div>
        </div>
    )
}

function generateSavingBreakdown(
    totalSavedAmount : number, 
    savingGoal: number
) {

    // Calculate the percentage saved
    const percentage = ((totalSavedAmount / savingGoal) * 100).toFixed(2)

    // Case 1: Goal is reached or exceeded
    if (totalSavedAmount >= savingGoal) {
        return totalSavedAmount === savingGoal
        ? `Congratulations! You've reached your saving goal of $${savingGoal.toLocaleString()} (${percentage}%).`
        : `Amazing! You've exceeded your saving goal by $${(totalSavedAmount - savingGoal).toLocaleString()} (${percentage}%).`
    }

    // Case 2: Goal is not yet reached
    const remainingAmount = savingGoal - totalSavedAmount
    return `You've saved ${percentage}% so far. Just $${remainingAmount.toLocaleString()} more to reach your goal!`

}