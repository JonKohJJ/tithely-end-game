"use client"

import { SendHorizontal } from "lucide-react"
import { NavigationData, SettingsData } from "@/data/NavigationData"
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

export function ProtectedNavBar() {

  const { setOpenMobile } = useSidebar();

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
                  {group.subItems.map((item) => (
                    <SidebarMenuItem key={item.name} onClick={() => setOpenMobile(false)}>
                      <SidebarMenuButton asChild>
                        <Link href={item.isDisabled ? "" : item.url} className={item.isDisabled ? "hover:cursor-not-allowed text-color-muted-text" : ""}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="">
                    <ThemeModeToggle additionalClasses="!border-none p-0 font-normal"/>
                  </Link>
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
