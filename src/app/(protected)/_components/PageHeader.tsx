import React, { ReactNode } from 'react'

export default function PageHeader({
    title,
    description,
    children
} : {
    title: string
    description: string
    children?: ReactNode
}) {
    return (
        <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
            <div className='flex flex-col'>
                <p className='fs-h2'>{title}</p>
                <p>{description}</p>
            </div>
            {children}
        </div>
    )
}
