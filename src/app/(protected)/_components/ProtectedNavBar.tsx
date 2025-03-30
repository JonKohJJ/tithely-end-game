"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { NavigationData } from "@/data/NavigationData"
import { usePathname } from "next/navigation"
import { Sprout } from "lucide-react"

export function ProtectedNavBar() {

  const { setOpenMobile } = useSidebar();
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="protect-nav-bar border-color-border bg-color-bg">

      <SidebarHeader className="h-[65px]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
                <Link href="/" className='flex items-center'>
                    <Sprout className='w-8 h-8' strokeWidth={2} />
                    <p className="fs-h2">Tithely</p>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
          {NavigationData.map(group => (
              <SidebarGroup key={group.title}>

                <SidebarGroupLabel>
                  <p className="fs-caption">{group.title}</p>
                </SidebarGroupLabel>

                <SidebarMenu>
                  {group.subItems.map((item) => {
                        return (
                          <SidebarMenuItem key={item.name} 
                            onClick={() => setOpenMobile(false)} 
                            className={`rounded-md ${item.url.includes(pathname) ? "bg-color-muted-text" : "hover:bg-color-border"}`}
                          >
                            <SidebarMenuButton asChild>
                              <Link href={item.url} className="flex justify-between">
                                <div className={`flex gap-2 items-center`}>
                                  <item.icon className="size-4" />
                                  <p>{item.name}</p>
                                </div>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      }
                    )
                  }
                </SidebarMenu>

              </SidebarGroup>
          ))}
      </SidebarContent>

    </Sidebar>
  )
}
