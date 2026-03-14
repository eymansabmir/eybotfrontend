import type { ReactNode } from "react"
import {
  BellIcon,
  BotIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"

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
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const mainNav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { label: "Bots", to: "/bots", icon: BotIcon },
  { label: "Campaign", to: "/campaign", icon: MegaphoneIcon },
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
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <BotIcon className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Ernst & Young</p>
              <p className="text-xs text-muted-foreground">Shape the future with confidence</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={
                        item.to === "/"
                          ? pathname === "/"
                          : pathname === item.to || pathname.startsWith(item.to + "/")
                      }
                    >
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* <SidebarSeparator /> */}

          {/* <SidebarGroup>
            <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Flow Builder" disabled>
                    <SparklesIcon className="size-4" />
                    <span>Flow Builder</span>
                    <Badge variant="outline">Beta</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings" disabled>
                    <Settings2Icon className="size-4" />
                    <span>Workspace Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}
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
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
            <Avatar className="size-10">
              <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="Operator" />
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold">Ops Manager</p>
              <p className="text-xs text-muted-foreground">online</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-2">
            Ctrl/Cmd + B to collapse
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />

      <SidebarInset>
        <Header />
        <main className="flex-1 bg-background px-6 pb-10 pt-6">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function Header() {
  return (
    <div className="border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div>
          <p className="text-xs uppercase text-muted-foreground">EY</p>
          <p className="font-medium">Ernst & Young</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input className="w-56" placeholder="Quick search" />
          <Button size="sm">New flow</Button>
          <Button variant="ghost" size="icon">
            <BellIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
