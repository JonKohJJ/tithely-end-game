"use client"

import { SendHorizontal } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ThemeModeToggle } from "@/components/ThemeModeToggle"
import { NavigationData, SettingsData } from "@/data/NavigationData"
import { usePathname } from "next/navigation"

export function ProtectedNavBar() {

  const { setOpenMobile } = useSidebar();
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="protect-nav-bar border-color-border bg-color-bg">

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                <Link href="/" className="!gap-0">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <SendHorizontal className="size-6 -rotate-90" />
                    </div>
                    <span className="fs-h3 font-medium">Tithely</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
          {NavigationData.map(group => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="font-light">{group.title}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.subItems.map((item) => {
                        return (
                          <SidebarMenuItem key={item.name} 
                            onClick={() => setOpenMobile(false)} 
                            className={`rounded-md ${item.url.includes(pathname) ? "bg-color-muted-text" : "hover:bg-color-muted-text"}`}
                          >
                            <SidebarMenuButton asChild>
                              <Link href={item.url} className="flex justify-between">
                                <div className={`flex gap-2 items-center`}>
                                  <item.icon className="size-4" />
                                  <span>{item.name}</span>
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

      <SidebarFooter className="!p-0">
        

        {SettingsData.map(group => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="font-light">{group.title}</SidebarGroupLabel>
            <SidebarMenu>

              {/* Theme Toggle here */}
              <SidebarMenuItem className="">
                <SidebarMenuButton asChild>
                  <ThemeModeToggle additionalClasses="!p-2 font-normal"/>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {group.subItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url ? item.url : ""}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

      </SidebarFooter>

    </Sidebar>
  )
}
