"use client"

import { useEffect, useRef, useState } from "react"

export default function StyleGuide() {
    // Refs for each paragraph tag
    const h1Ref = useRef<HTMLParagraphElement>(null)
    const h2Ref = useRef<HTMLParagraphElement>(null)
    const h3Ref = useRef<HTMLParagraphElement>(null)
    const baseRef = useRef<HTMLParagraphElement>(null)
    const captionRef = useRef<HTMLParagraphElement>(null)
    
    // State to hold font sizes
    const [fontSizes, setFontSizes] = useState<{ [key: string]: string }>({})

    // Function to update font sizes
    const updateFontSizes = () => {
        const refs = [h1Ref, h2Ref, h3Ref, baseRef, captionRef]
        const newFontSizes: { [key: string]: string } = {}
        refs.forEach((ref, index) => {
        if (ref.current) {
            const computedStyle = window.getComputedStyle(ref.current)
            const fontSize = computedStyle.getPropertyValue('font-size')
            newFontSizes[`fs-${index + 1}`] = fontSize;
        }
        });
        setFontSizes(newFontSizes)
    }

    useEffect(() => {
        // Update font sizes initially
        updateFontSizes();
    
        // Add event listener for window resize event
        window.addEventListener('resize', updateFontSizes);
    
        // Cleanup function
        return () => {
          window.removeEventListener('resize', updateFontSizes);
        };
    }, [])

    return (
        <section className='mysection style-guide'>
            <div className='mycontainer flex flex-col gap-24'>
                <div>
                    <p className='fs-caption text-color-text-muted'>fs-h1 / {fontSizes['fs-1']}</p>
                    <p className="fs-h1" ref={h1Ref}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque tempora molestiae aperiam.</p>
                </div>
                <div>
                    <p className='fs-caption text-color-text-muted'>fs-h2 / {fontSizes['fs-2']}</p>
                    <p className="fs-h2" ref={h2Ref}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis error corporis aliquam iusto doloribus expedita commodi distinctio similique voluptate dolore facilis vitae et debitis omnis quidem cupiditate, minus, quasi enim?</p>
                </div>
                <div>
                    <p className='fs-caption text-color-text-muted'>fs-h3 / {fontSizes['fs-3']}</p>
                    <p className="fs-h3" ref={h3Ref}>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Accusantium ea provident cupiditate consequatur? Saepe doloremque, ut molestiae vero magni, sed quod expedita inventore temporibus corporis delectus, fugiat officia rem quo!</p>
                </div>
                <div>
                    <p className='fs-caption text-color-text-muted'>fs-base / {fontSizes['fs-4']}</p>
                    <p className="fs-base" ref={baseRef}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto vitae commodi natus laudantium consequuntur numquam. Illo aut neque, adipisci nesciunt, optio, itaque vel odit ab modi tempore voluptatum nostrum! Recusandae!</p>
                </div>
                <div>
                    <p className='fs-caption text-color-text-muted'>fs-caption / {fontSizes['fs-5']}</p>
                    <p className="fs-caption" ref={captionRef}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem, quisquam dolores est, beatae cumque vero reprehenderit culpa qui harum alias nisi dicta, recusandae aut magni labore obcaecati eligendi quia facilis quibusdam perspiciatis! Iste tempore sit repellendus itaque est? Unde fuga, velit reiciendis obcaecati est eum aperiam! Ipsum, vero! Iste, corrupti? Numquam adipisci minus quia voluptates impedit hic unde, aperiam consectetur iure vero accusantium enim, amet ut quidem totam quo deserunt atque illum reprehenderit debitis! Quasi quod a voluptates debitis quaerat facere ad.</p>
                </div>
            </div>
        </section>
    )
}
