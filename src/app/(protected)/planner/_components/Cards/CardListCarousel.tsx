"use client"

import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { TFetchedCardWithChildTransactionCount } from "@/server/db/cards"
import { Button } from "@/components/ui/button"
import CardForm from "./CardForm"

export default function CardListCarousel({
    allCards,
    emptySlotsCount
} : {
    allCards: TFetchedCardWithChildTransactionCount[]
    emptySlotsCount: number
}) {
    const [activeIndex, setActiveIndex] = useState(0)

    const goToPrevious = () => {
      setActiveIndex((prevIndex) => (prevIndex === 0 ? allCardsWithEmptySlots.length - 1 : prevIndex - 1))
    }
  
    const goToNext = () => {
      setActiveIndex((prevIndex) => (prevIndex === allCardsWithEmptySlots.length - 1 ? 0 : prevIndex + 1))
    }

    const allCardsWithEmptySlots = [
        ...allCards,
        ...Array.from({ length: emptySlotsCount }).map(() => ({ isForm: true }))
    ];

    const [isMdScreen, setIsMdScreen] = useState(false);
    useEffect(() => {
        const updateScreenSize = () => {
            setIsMdScreen(window.innerWidth > 767); // true when 768px and above
        };
        updateScreenSize();
        window.addEventListener("resize", updateScreenSize);
        return () => window.removeEventListener("resize", updateScreenSize);
    }, []);

    return (
        <div className={cn(
            "card-list-carousel flex-1 relative w-full overflow-hidden min-h-[300px] lg:min-h-[unset]",
        )}>

            <div className="relative w-full h-full flex flex-col gap-4">
                {allCardsWithEmptySlots.map((card, index) => {

                    const distance = Math.abs(activeIndex - index)
                    const isActive = index === activeIndex
                    const direction = index > activeIndex ? 1 : -1

                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute w-[calc(100%-3rem)] transition-all duration-300 ease-in-out" 
                            )}
                            style={{
                                zIndex: allCardsWithEmptySlots.length - distance,
                                opacity: Math.max(0.4, 1 - distance * 0.2),
                                top: isActive ? "50%" : `calc(50% + ${direction * 40 * distance}px)`,
                                transform: `translateY(-50%) scale(${1 - distance * 0.1})`,
                                pointerEvents: (isActive && isMdScreen) ? "auto" : "none",
                            }}
                        >
                            {"isForm" in card ? <CardForm isMdScreen={isMdScreen} /> : <ExistingCard card={card} />}
                        </div>
                    )
                })}
            </div>
    
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12">
                <Button
                    className="!shadow-none h-8 w-8"
                    onClick={goToPrevious}
                >
                    <ChevronUp className="!h-6 !w-6" />
                </Button>

                <div className="flex flex-col gap-1 py-2">
                    {allCardsWithEmptySlots.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "h-2 w-3 rounded-xl transition-all",
                                index === activeIndex ? "bg-color-text w-4" : "bg-color-border",
                            )}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to card ${index + 1}`}
                        />
                    ))}
                </div>

                <Button
                    className="!shadow-none h-8 w-8"
                    onClick={goToNext}
                >
                    <ChevronDown className="!h-6 !w-6" />
                </Button>
            </div>

        </div>
    )
}

function ExistingCard({
    card,
} : {
    card: TFetchedCardWithChildTransactionCount
}) {
    return (
        <div className={`h-full min-h-[200px] lg:min-h-[250px] border border-color-border p-6 pb-8 rounded-xl flex flex-col justify-between bg-color-bg`}>
            <div className="flex justify-between items-center lg:mb-4">
                <CreditCard />
                <CardForm cardTobeEdited={card} />
            </div>
            <div className="lg:mt-4">
                <p className="fs-h3">{card.cardName}</p>
                <CreditCardProgress 
                    cardCurrentCharge={card.cardCurrentCharge}
                    cardMinimumSpend={card.cardMinimumSpend}
                    cardMaximumBudget={card.cardMaximumBudget}
                />
            </div>
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
