import SubcriptionPlans from "@/components/SubcriptionPlans";
import { getUserSubscriptionTier } from "@/server/db/subscription";
import { currentUser } from "@clerk/nextjs/server";

export default async function PricingSection() {

    const hasUser = await currentUser()

    return (
        <section className="mysection">
            <div className="mycontainer">
                <div className="mx-auto max-w-screen-md text-center mb-12">
                    <p className="mb-4">Designed for business teams like yours</p>
                    <p className="">Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.</p>
                </div>

                <SubcriptionPlans 
                    currentPlanName={hasUser ? (await getUserSubscriptionTier(hasUser.id)).name : null} 
                />
            </div>
        </section>
    )
}

