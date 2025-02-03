import Link from 'next/link'
import React from 'react'

export default function PublicFooter() {
    return (
        <section className="mysection border-t-[1px] border-color-border">
            <div className="mycontainer !py-20 flex flex-col md:flex-row gap-4 justify-center items-center text-center">
                <p>&copy; {new Date().getFullYear()} Tithely End Game All Rights Reserved</p>
                ∙
                <Link href="/style-guide"><p>Style Guide</p></Link>
            </div>
        </section>
    )
}
