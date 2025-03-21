import { getAllAccounts, TFetchedAccountWithChildTransactionCount } from "@/server/db/accounts";
import { getUserSubscriptionTier } from "@/server/db/subscription";
import CardsAccountsCarousel from "../CardsAccountsCarousel";

export default async function AccountList({
    userId,
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allAccounts: TFetchedAccountWithChildTransactionCount[] = [];

    try {
        allAccounts = await getAllAccounts(userId)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    const { maxNumberOfAccounts } = await getUserSubscriptionTier(userId)
    const EmptySlotsCount = maxNumberOfAccounts - allAccounts.length

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <CardsAccountsCarousel
                        cardOrAccount="account"
                        allItems={allAccounts}
                        emptySlotsCount={EmptySlotsCount}
                    />
                )
            }
        </>
    )
}
