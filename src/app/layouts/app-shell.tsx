import { useEffect, useState } from "react"
import type { ComponentType, ReactNode, SVGProps } from "react"
import {
  BotIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MoonIcon,
  // PhoneCallIcon,
  Settings2Icon,
  SunIcon,
  UsersIcon,
  ChevronRight,
  LogOut,
  MoreVertical,
  SearchIcon,
  History,
} from "lucide-react"

interface SidebarSubNavItem {
  label: string;
  to: string;
}

interface SidebarNavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  featureFlag?: keyof typeof ENV.FEATURES;
  items?: SidebarSubNavItem[];
}
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { EYLogo } from "@/components/branding/ey-logo"
import { authClient } from "@/lib/auth-client"
import { ENV } from "@/config/env"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommandMenu } from "./components/command-menu"
// import { NotificationsMenu } from "./components/notifications-menu"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const mainNav: SidebarNavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { label: "Bots", to: "/bots", icon: BotIcon },
  {
    label: "Campaign",
    to: "/campaign",
    icon: MegaphoneIcon,
    featureFlag: "CAMPAIGNS" as const
  },
  // {
  //   label: "Voice Tech",
  //   to: "/voice-tech",
  //   icon: PhoneCallIcon,
  //   featureFlag: "VOICE_TECH" as const,
  //   items: [
  //     { label: "Orchestrations", to: "/voice-tech" },
  //     { label: "Datasets", to: "/voice-tech/datasets" },
  //     { label: "Vendors", to: "/voice-tech/vendors" },
  //   ],
  // },
  {
    label: "Users",
    to: "/users",
    icon: UsersIcon,
    featureFlag: "USERS" as const
  },
]

const footerNav: SidebarNavItem[] = [
  { label: "Activity Logs", to: "/activity-logs", icon: History },
  { label: "Settings", to: "/settings", icon: Settings2Icon },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [commandOpen, setCommandOpen] = useState(false)

  const isEditor = pathname.startsWith("/bot/")

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void navigate({ to: "/login" })
        },
      },
    })
  }

  const user = session?.user

  if (isEditor) {
    return <main className="h-screen w-screen overflow-hidden">{children}</main>
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex min-w-0 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
              <EYLogo className="h-5 shrink-0 text-foreground" />
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
                {mainNav
                  .filter((item) => !item.featureFlag || ENV.FEATURES[item.featureFlag])
                  .map((item) => {
                  const hasSubItems = Array.isArray(item.items) && item.items.length > 0;
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
                                isActive && "bg-accent/50 text-foreground border-l-[3px] border-yellow-400 font-bold"
                              )}
                            >
                              <item.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem: SidebarSubNavItem) => (
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
                          isActive && "bg-accent/50 text-foreground border-l-[3px] border-yellow-400 font-bold"
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
          <div className="mt-auto border-t border-slate-200/50 pt-4 dark:border-slate-800/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                  <Avatar className="size-9 shrink-0 ring-2 ring-white/50 dark:ring-slate-900/50">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.name?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-bold leading-tight">{user?.name || "User"}</p>
                    <p className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                      {user?.email || "online"}
                    </p>
                  </div>
                  <MoreVertical className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56" sideOffset={12}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex w-full items-center">
                    <Settings2Icon className="mr-2 size-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/20"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
            Ctrl/Cmd + B to collapse
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <Header onSearchClick={() => setCommandOpen(true)} />
        <main className="flex-1 min-w-0 overflow-x-hidden bg-background px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
          <div className="mx-auto min-w-0 w-full max-w-6xl">
            {children}
          </div>
        </main>
        <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}

function Header({ onSearchClick }: { onSearchClick: () => void }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6 sm:py-4">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="ml-auto flex min-w-0 items-center gap-3">
          <button
            onClick={onSearchClick}
            className="group hidden md:flex items-center gap-2 px-3 h-9 w-40 lg:w-56 bg-muted/50 border border-input text-muted-foreground text-[10px] rounded-lg hover:bg-accent/50 transition-all text-left"
          >
            <SearchIcon className="size-3.5" />
            <span className="flex-1">Quick search...</span>
            <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[8px] font-medium opacity-100">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm h-9 px-5 rounded-lg text-xs font-bold"
            onClick={() => navigate({ to: "/create-bot" })}
          >
            New flow
          </Button>
          {/* <NotificationsMenu /> */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-input bg-background/60 backdrop-blur-sm transition-all hover:bg-accent dark:border-border dark:bg-slate-950/50 dark:hover:bg-slate-900"
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
