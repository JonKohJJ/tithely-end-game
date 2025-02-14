import FAQSection from "./_components/FAQ";
import Features from "./_components/Features";
import Hero from "./_components/Hero";
import PricingSection from "./_components/PricingSection";


export default function HomePage() {

    return (
        <section className='mysection home'>
            <div className='mycontainer flex flex-col gap-20 md:gap-40'>
                <Hero />
                <Features />
                <PricingSection />
                <FAQSection />
            </div>
        </section>
    )
}
