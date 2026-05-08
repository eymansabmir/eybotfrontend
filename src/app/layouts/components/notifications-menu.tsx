import * as React from "react"
import {
  BellIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  MessageSquareIcon,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBots } from "@/features/bots/data/queries/use-bots"
import { useCampaigns } from "@/features/campaign/api/campaign-queries"
import { formatDistanceToNow } from "date-fns"

export function NotificationsMenu() {
  const { data: bots = [] } = useBots()
  const { data: campaigns = [] } = useCampaigns()

  // Derive notifications from recent bots and campaigns
  const notifications = React.useMemo(() => {
    const items = [
      ...bots.slice(0, 3).map((bot) => ({
        id: `bot-${bot.id}`,
        title: "New Bot Created",
        description: `Bot "${bot.name}" is now ready for configuration.`,
        time: new Date(bot.createdAt),
        icon: MessageSquareIcon,
        color: "text-blue-500",
      })),
      ...campaigns.slice(0, 2).map((camp) => ({
        id: `camp-${camp.id}`,
        title: "Campaign Status",
        description: `Campaign "${camp.name}" is currently ${camp.status}.`,
        time: new Date(camp.updatedAt),
        icon: CheckCircle2Icon,
        color: "text-green-500",
      })),
    ]

    return items.sort((a, b) => b.time.getTime() - a.time.getTime())
  }, [bots, campaigns])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="size-4" />
          {notifications.length > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex gap-3 border-b p-4 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={`mt-1 rounded-full p-1 bg-slate-100 ${notif.color}`}>
                    <notif.icon className="size-3" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium leading-none">{notif.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                      <ClockIcon className="size-2.5" />
                      <span>{formatDistanceToNow(notif.time, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <CircleIcon className="mb-2 size-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No new notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground hover:text-primary">
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
