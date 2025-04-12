import { auth } from "@clerk/nextjs/server"
import { ReactNode } from "react"
import Link from "next/link"

export async function HasPermission({
  permission,
  renderFallback = false,
  children,
}: {
  permission: (userId: string | null) => Promise<boolean>
  renderFallback?: boolean
  children: ReactNode
}) {
  const { userId } = await auth()
  const hasPermission = await permission(userId)
  if (hasPermission) return children
  if (renderFallback) return <p>Access Denied. <Link href="/subscription" className="underline">Upgrade</Link> to access this feature.</p>
  return null
}