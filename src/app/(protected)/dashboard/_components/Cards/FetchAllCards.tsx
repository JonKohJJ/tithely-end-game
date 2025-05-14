import { getAllCards, TFetchedCard } from '@/server/db/cards'
import React from 'react'
import AllCards from './AllCards'

export default async function FetchAllCards({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()
    const showClaimables = searchParams.showClaimables === "true" ? true : false

    let errorMessage: null | string = null
    let allCards: TFetchedCard[] = []

    try {
        allCards = await getAllCards(userId, month, year, showClaimables)

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
                    <div className="FetchAllCards">
                        <AllCards
                            allCards={allCards}
                        />
                    </div>
                )
            }
        </>
    )
}
