import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  BellIcon,
  BotIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MoonIcon,
  PhoneCallIcon,
  Settings2Icon,
  SunIcon,
  UsersIcon,
  ChevronRight,
} from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { EYLogo } from "@/components/branding/ey-logo"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

const mainNav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { label: "Bots", to: "/bots", icon: BotIcon },
  { label: "Campaign", to: "/campaign", icon: MegaphoneIcon },
  {
    label: "Voice Tech",
    to: "/voice-tech",
    icon: PhoneCallIcon,
    items: [
      { label: "Orchestrations", to: "/voice-tech" },
      { label: "Datasets", to: "/voice-tech/datasets" },
      { label: "Vendors", to: "/voice-tech/vendors" },
    ],
  },
  { label: "Users", to: "/users", icon: UsersIcon },
]

const footerNav = [
  { label: "Settings", to: "/settings", icon: Settings2Icon },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const isEditor = pathname.startsWith("/bot/")

  if (isEditor) {
    return <main className="h-screen w-screen overflow-hidden">{children}</main>
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur">
              <EYLogo className="h-5 shrink-0" />
            </div>
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold">Ernst & Young</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Workspace</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0;
                  const isActive = item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(item.to + "/");

                  if (hasSubItems) {
                    return (
                      <Collapsible
                        key={item.label}
                        asChild
                        defaultOpen={isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton 
                              tooltip={item.label} 
                              isActive={isActive}
                              className={cn(
                                "transition-all duration-200 h-10 rounded-none",
                                isActive && "bg-slate-50 text-foreground border-l-[3px] border-yellow-400 font-bold"
                              )}
                            >
                              <item.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.to}>
                                    <Link to={subItem.to}>
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200 h-10 rounded-none",
                          isActive && "bg-slate-50 text-foreground border-l-[3px] border-yellow-400 font-bold"
                        )}
                      >
                        <Link to={item.to}>
                          <item.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {footerNav.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  isActive={pathname === item.to}
                >
                  <Link to={item.to}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 group-data-[collapsible=icon]:hidden">
            <Avatar className="size-10">
              <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="Operator" />
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold">Ops Manager</p>
              <p className="text-xs text-muted-foreground">online</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
            Ctrl/Cmd + B to collapse
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <Header />
        <main className="flex-1 min-w-0 overflow-x-hidden bg-background px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
          <div className="mx-auto min-w-0 w-full max-w-6xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6 sm:py-4">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        {/* Removed duplicate EY text as requested to keep only one EY icon in the navbar/sidebar */}
        <div className="ml-auto flex min-w-0 items-center gap-3">
          <Input className="hidden w-40 lg:w-56 md:block h-9 bg-slate-50/50 border-slate-200 text-xs rounded-lg" placeholder="Quick search..." />
          <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm h-9 px-5 rounded-lg text-xs font-bold">
            New flow
          </Button>
          <Button variant="ghost" size="icon">
            <BellIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-200 bg-white/60 backdrop-blur-sm transition-all hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-900"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
import { cn } from "@/lib/utils";
