import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { UserIcon, KeyIcon } from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    label: "My Account",
    href: "/settings",
    icon: UserIcon,
    description: "Manage your profile and account settings"
  },
  {
    label: "Credentials",
    href: "/settings/credentials",
    icon: KeyIcon,
    description: "Manage API keys and integration credentials"
  },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full relative">
      <aside className="lg:w-[60px] hover:lg:w-64 transition-all duration-300 ease-in-out group z-20">
        <nav className="flex lg:flex-col gap-2 p-1.5 rounded-2xl bg-muted/30 border border-muted/20 backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center h-11 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="size-[48px] flex items-center justify-center shrink-0">
                  <item.icon className="size-[18px]" />
                </div>
                <span className={cn(
                  "font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:ml-1",
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-primary-foreground rounded-r-full hidden lg:block" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-5xl animate-in fade-in slide-in-from-right-4 duration-500">
        {children}
      </div>
    </div>
  );
}
