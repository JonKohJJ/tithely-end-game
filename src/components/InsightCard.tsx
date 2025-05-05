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
        <Card className="w-full h-full flex flex-col gap-2 justify-between border-[1px] border-color-border !shadow-none rounded-xl">
            <CardHeader>

                <CardTitle className="flex gap-2 items-center justify-between">
                    <p>{title}</p>
                    {icon && icon} 
                </CardTitle>

                <CardDescription>
                    <p className="fs-caption">{description}</p>
                </CardDescription>

            </CardHeader>

            <CardContent>
                {typeof content === "string" 
                    ? <p className="fs-h3">{content}</p>
                    : <div className="fs-h3">{content}</div>
                }
            </CardContent>
        </Card>
    )
}