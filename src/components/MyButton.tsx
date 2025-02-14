import { ReactNode } from 'react'
import { Button } from './ui/button'

export default function MyButton({
    children,
    additionalClasses,
    disabled,
    type,
    onClickFunction, 
} : {
    children: ReactNode
    additionalClasses?: string
    disabled?: boolean
    type?: "button" | "submit" | "reset"
    onClickFunction?: () => void
}) {
    return (
        <Button 
            type={type} 
            disabled={disabled} 
            className={`shadow-none border-[1px] border-color-text bg-color-text text-color-bg hover:bg-color-bg hover:text-color-text ${additionalClasses}`}
            onClick={onClickFunction}
        >
            {children}
        </Button>
    )
}
