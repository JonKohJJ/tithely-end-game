import { getSavingsGrowthData, TSavingGrowth } from "@/server/db/savings"
import { SavingsGrowthLineChart } from "./SavingsGrowthLineChart"

export default async function FetchSavingsGrowthLineChart({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allSavingsGrowthData: TSavingGrowth = {
        totalSavingsAmount: 0,
        past12MonthsData: [],
        savingRate: ""
    }

    // Fetch data here to make suspense work
    try {

        allSavingsGrowthData = await getSavingsGrowthData(userId)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }


    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className={`FetchSavingsGrowthLineChart`}>
                        <SavingsGrowthLineChart 
                            allSavingsGrowthData={allSavingsGrowthData}
                        />
                    </div>
                )
            }
        </>
    )
}
