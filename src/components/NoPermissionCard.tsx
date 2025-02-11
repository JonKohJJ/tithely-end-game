import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "./ui/card"
import { ReactNode } from "react"
import MyButton from "./MyButton"

export default function NoPermissionCard({
    children = "You do not have permission to perform this action. Try upgrading your account to access this feature.",
}: {
    children?: ReactNode
}) {
    return (
        <Card className="shadow-none border-color-border">
            <CardHeader>
                <CardTitle className="text-xl">Permission Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{children}</CardDescription>
            </CardContent>
            <CardFooter>
                <MyButton>
                    <Link href="/subscription">Upgrade Account</Link>
                </MyButton>
            </CardFooter>
      </Card>
    )
}
