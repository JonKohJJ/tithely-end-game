import MyButton from '@/components/MyButton'
import { Card } from '@/components/ui/card'
import { TSavingGoal } from '@/server/db/analytics'
import { ChevronRight, PiggyBank } from 'lucide-react'

export default function SavingsGoals({
    allSavingsGoalsData
} : {
    allSavingsGoalsData: TSavingGoal[]
}) {

    return (
        <div className='flex flex-col gap-4'>

            <div className="grid grid-cols-4 gap-4">
                {allSavingsGoalsData.map((goal, index) => {
                    
                    const percentage = (goal.totalSavedAmount / goal.savingGoal) * 100
                    const goalDescription = generateGoalDescription(goal.totalSavedAmount, goal.savingGoal)

                    return (

                        <Card key={index} className="shadow-none border-color-border p-8 flex flex-col gap-8 w-full">
                            <div className="w-full flex flex-col items-center gap-4">
                                <ProgressCircle
                                    percentage={percentage}
                                    color={goal.fill}
                                />

                                <div className="flex flex-col items-center">
                                    <p className="fs-h3">{goal.categoryName}</p>
                                    <p className='text-center'>{goalDescription}</p>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <p className="fs-h3">${goal.totalSavedAmount.toLocaleString()}</p>
                                    <p className="fs-h3">/</p>
                                    <p className="fs-h3">${goal.savingGoal.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="w-full flex items-center justify-center">
                                <MyButton additionalClasses="bg-transparent text-color-text border-none group">
                                    <p>View Details</p>
                                    <ChevronRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                                </MyButton>
                            </div>
                        </Card>

                    )}
                )}

                {Array.from({ length: (4 - (allSavingsGoalsData.length % 4)) % 4 }).map((_, index) => (
                    <div key={`empty-${index}`} />
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

function generateGoalDescription(
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