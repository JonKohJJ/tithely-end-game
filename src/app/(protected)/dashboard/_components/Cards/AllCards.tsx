import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TFetchedCard } from '@/server/db/cards'
import React from 'react'
import CardForm from './CardForm'

export default function AllCards({
    allCards
} : {
    allCards: TFetchedCard[]
}) {
    return (
        <div className="flex flex-col gap-4">
            {allCards.map(card => (
                <Card key={card.cardId} className='border border-color-border shadow-none'>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <p className="fs-h3">{card.cardName}</p>
                            <CardForm cardTobeEdited={card}/>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p>Current Monthly Charge: ${card.cardMonthlyCharge}</p>
                        <CreditCardProgress 
                            cardCurrentCharge={card.cardMonthlyCharge}
                            cardMinimumSpend={card.cardMinimumSpend}
                            cardMaximumBudget={card.cardMaximumBudget}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function CreditCardProgress({ 
    cardCurrentCharge, 
    cardMinimumSpend, 
    cardMaximumBudget 
}: {
    cardCurrentCharge: number
    cardMinimumSpend: number
    cardMaximumBudget: number
}) {

    const maxValue = Math.max(cardCurrentCharge, cardMinimumSpend, cardMaximumBudget)
    const currentChargePercentage = calculatePercentage(cardCurrentCharge, maxValue)
    const minimumSpendPercentage = calculatePercentage(cardMinimumSpend, maxValue)
    const cardBudgetPercentage = calculatePercentage(cardMaximumBudget, maxValue)

  return (
    <div className="relative mt-8 lg:mt-12 mb-4">

        {(minimumSpendPercentage === 0) && (cardBudgetPercentage === 0) 
            ?
                <>
                    <div className={`absolute top-1 -translate-y-1/2 flex flex-col gap-1 fs-caption`}>
                        <p>No Min Spend</p>
                        <div className={`indicator-line h-4`}></div>
                        <p>${cardMinimumSpend}</p>
                    </div>
                    <div className={`absolute top-1 right-0 text-right -translate-y-1/2 flex flex-col gap-1 fs-caption`}>
                        <p>No Max Budget</p>
                        <div className={`indicator-line h-4`}></div>
                        <p>${cardMaximumBudget}</p>
                    </div>
                </>
            :
                <>
                    {cardBudgetPercentage === 100 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x-full flex flex-col gap-1 items-end fs-caption w-max`} 
                            style={{ left: `${cardBudgetPercentage}%` }}
                        >
                            <p>Max Budget</p>
                            <div className={`indicator-line h-4`}></div>
                            <p>${cardMaximumBudget}</p>
                        </div>
                    )}

                    {cardBudgetPercentage === 0 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x flex flex-col gap-1 items-start fs-caption w-max`} 
                            style={{ left: `${cardBudgetPercentage}%` }}
                        >
                            <p>No Max Budget</p>
                            <div className={`indicator-line h-4`}></div>
                            <p>${cardMaximumBudget}</p>
                        </div>
                    )}

                    {minimumSpendPercentage === 100 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x-full flex flex-col gap-1 items-end fs-caption w-max`} 
                            style={{ left: `${minimumSpendPercentage}%` }}
                        >
                            <p>Min Spend</p>
                            <div className={`indicator-line h-4`}></div>
                            <p>${cardMinimumSpend}</p>
                        </div>
                    )}

                    {minimumSpendPercentage === 0 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x flex flex-col gap-1 items-start fs-caption w-max`} 
                            style={{ left: `${minimumSpendPercentage}%` }}
                        >
                            <p>No Min Spend</p>
                            <div className={`indicator-line h-4`}></div>
                            <p>${cardMinimumSpend}</p>
                        </div>
                    )}


                    {cardBudgetPercentage > 0 && cardBudgetPercentage < 100 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x-1/2 flex flex-col gap-1 items-center fs-caption w-max`} 
                            style={{ left: `${cardBudgetPercentage}%` }}
                        >
                            <p>Max Budget</p>
                            <div className={`indicator-line h-4 w-[1px] bg-color-text`}></div>
                            <p>${cardMaximumBudget}</p>
                        </div>
                    )}

                    {minimumSpendPercentage > 0 && minimumSpendPercentage < 100 && (
                        <div 
                            className={`absolute top-1 -translate-y-1/2 -translate-x-1/2 flex flex-col gap-1 items-center fs-caption w-max`} 
                            style={{ left: `${minimumSpendPercentage}%` }}
                        >
                            <p>Min Spend</p>
                            <div className={`indicator-line h-4 w-[1px] bg-color-text`}></div>
                            <p>${cardMinimumSpend}</p>
                        </div>
                    )}
                </>
        }


        <div className="overflow-hidden h-2 flex bg-color-muted-text rounded">
            <div
                style={{ width: `${currentChargePercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap bg-color-text justify-center"
                role="progressbar"
                aria-valuenow={cardCurrentCharge}
                aria-valuemin={0}
                aria-valuemax={maxValue}
            ></div>
        </div>
    </div>
  )
}

function calculatePercentage(value: number, maxValue:number) {
    const result = (value/maxValue)*100
    if (Number.isNaN(result)) {
        return 0
    }
    return result
}