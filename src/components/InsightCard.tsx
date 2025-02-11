import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

export function InsightCard({
    title,
    description,
    content,
    icon
} : {
    title: string
    description: string
    content: string | ReactNode
    icon?: ReactNode

}) {
    return (
        <Card className="w-full flex flex-col gap-4 justify-between border-[1px] border-color-border !shadow-none">
            <CardHeader>
                <CardTitle className="flex gap-2 items-center justify-between">
                    <p>{title}</p>
                    {icon && icon}
                </CardTitle>
                <CardDescription className="font-light">{description}</CardDescription>
            </CardHeader>
            <CardContent className="fs-base">{content}</CardContent>
        </Card>
    )
}