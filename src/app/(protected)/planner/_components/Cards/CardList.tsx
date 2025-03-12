import { getAllCards, TFetchedCardWithChildTransactionCount } from "@/server/db/cards"
import { getUserSubscriptionTier } from "@/server/db/subscription";
import CardListCarousel from "./CardListCarousel";


export default async function CardList({
    userId,
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allCards: TFetchedCardWithChildTransactionCount[] = [];

    try {
        allCards = await getAllCards(userId)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    const { maxNumberOfCards } = await getUserSubscriptionTier(userId)
    const EmptySlotsCount = maxNumberOfCards - allCards.length

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <CardListCarousel
                        allCards={allCards}
                        emptySlotsCount={EmptySlotsCount}
                    />
                )
            }
        </>
    )
}
