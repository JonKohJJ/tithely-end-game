"use client"

import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { TFetchedAccountWithChildTransactionCount } from "@/server/db/accounts"
import { Button } from "@/components/ui/button"
import AccountForm from "./AccountForm"


export default function AccountListCarousel({
    allAccounts,
    emptySlotsCount
} : {
    allAccounts: TFetchedAccountWithChildTransactionCount[]
    emptySlotsCount: number
}) {
    const [activeIndex, setActiveIndex] = useState(0)

    const goToPrevious = () => {
      setActiveIndex((prevIndex) => (prevIndex === 0 ? allAccountsWithEmptySlots.length - 1 : prevIndex - 1))
    }
  
    const goToNext = () => {
      setActiveIndex((prevIndex) => (prevIndex === allAccountsWithEmptySlots.length - 1 ? 0 : prevIndex + 1))
    }

    const allAccountsWithEmptySlots = [
        ...allAccounts,
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
            "account-list-carousel flex-1 relative w-full overflow-hidden min-h-[300px] lg:min-h-[unset]",
        )}>

            <div className="relative w-full h-full flex flex-col gap-4">
                {allAccountsWithEmptySlots.map((account, index) => {

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
                                zIndex: allAccountsWithEmptySlots.length - distance,
                                opacity: Math.max(0.4, 1 - distance * 0.2),
                                top: isActive ? "50%" : `calc(50% + ${direction * 40 * distance}px)`,
                                transform: `translateY(-50%) scale(${1 - distance * 0.1})`,
                                pointerEvents: (isActive && isMdScreen) ? "auto" : "none",
                            }}
                        >
                            {"isForm" in account ? <AccountForm isMdScreen={isMdScreen} /> : <ExistingAccount account={account} />}
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
                    {allAccountsWithEmptySlots.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "h-2 w-3 rounded-xl transition-all",
                                index === activeIndex ? "bg-color-text w-4" : "bg-color-border",
                            )}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to account ${index + 1}`}
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

function ExistingAccount({
    account,
} : {
    account: TFetchedAccountWithChildTransactionCount
}) {
    return (
        <div className={`h-full min-h-[200px] lg:min-h-[250px] border border-color-border p-6 pb-8 rounded-xl flex flex-col justify-between bg-color-bg`}>
            <div className="flex justify-between items-center lg:mb-4">
                <PiggyBank />
                <AccountForm accountTobeEdited={account} />
            </div>
            <div className="lg:mt-4">
                <p className="fs-h3">{account.accountName}</p>
                <p>more account details goes here</p>
            </div>
        </div>
    )
}
