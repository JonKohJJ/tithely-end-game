import React from 'react'

export default function SectionHeaders({
    title,
    description
} : {
    title: string
    description: string
}) {
    return (
        <div className='flex flex-col'>
            <p className='fs-h3'>{title}</p>
            <p>{description}</p>
        </div>
    )
}
