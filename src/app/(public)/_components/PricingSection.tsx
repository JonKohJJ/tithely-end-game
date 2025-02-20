import SubcriptionPlans from "@/components/SubcriptionPlans";
import { getUserSubscriptionTier } from "@/server/db/subscription";
import { currentUser } from "@clerk/nextjs/server";

export default async function PricingSection() {

    const hasUser = await currentUser()

    return (
        <section className="mysection">
            <div className="mycontainer">
                <div className="mx-auto max-w-screen-md text-center mb-12">
                    <p className="mb-4 fs-h2">Find the Right Plan for Your Financial Journey</p>
                    <p>Get the tools you need to track, manage, and optimize your spending—whether you&apos;re just starting out or need advanced budgeting features.</p>
                </div>

                <SubcriptionPlans 
                    currentPlanName={hasUser ? (await getUserSubscriptionTier(hasUser.id)).name : null} 
                />
            </div>
        </section>
    )
}

