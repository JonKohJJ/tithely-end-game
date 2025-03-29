import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "./ui/card"
import MyButton from "./MyButton"

export default function NoPermissionCard({
    fallbackActionText,
}: {
    fallbackActionText?: string
}) {
    return (
        <Card className="shadow-none border-color-border h-full flex flex-col items-center justify-center text-center">
            <CardHeader>
                <CardTitle>
                    <p className="fs-h3">❗Access Denied❗</p>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    <p className="px-10">
                        {fallbackActionText && `You do not have permission to ${fallbackActionText}.`} Ugrade your account to access this feature.
                    </p>
                </CardDescription>
            </CardContent>
            <CardFooter>
                <MyButton>
                    <Link href="/subscription">Upgrade Account</Link>
                </MyButton>
            </CardFooter>
      </Card>
    )
}
