import { getAllCards, TFetchedCardWithChildTransactionCount } from "@/server/db/cards"
import CardForm from "./CardForm";

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

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className="card-list flex flex-col gap-8">

                        {allCards.length > 0 
                            ? (
                                allCards.map(card => (
                                    <div key={card.cardId} className="card-item border border-color-border p-6 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p>{card.cardName}</p>
                                            <CardForm cardTobeEdited={card}/>
                                        </div>
                                        <p>Current Charge - ${card.cardCurrentCharge}</p>
                                        <p>Minimum Spend - ${card.cardMinimumSpend}</p>
                                    </div>
                                ))
                            )
                            : <p>No Cards Found.</p>
                        }

                    </div>
                )
            }
        </>
    )
}