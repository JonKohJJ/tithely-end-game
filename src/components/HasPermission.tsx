import { auth } from "@clerk/nextjs/server"
import { ReactNode } from "react"
import NoPermissionCard from "./NoPermissionCard"

export async function HasPermission({
  permission,
  renderFallback = false,
  fallbackActionText,
  children,
}: {
  permission: (userId: string | null) => Promise<boolean>
  renderFallback?: boolean
  fallbackActionText?: string
  children: ReactNode
}) {
  const { userId } = await auth()
  const hasPermission = await permission(userId)
  if (hasPermission) return children
  if (renderFallback) return <NoPermissionCard fallbackActionText={fallbackActionText} />
  return null
}