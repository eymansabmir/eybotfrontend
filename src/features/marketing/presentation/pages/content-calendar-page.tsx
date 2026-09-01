import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { useMarketingStore } from "../../data/marketing-store";
import { platformLabels } from "../../data/social-campaigns.mock";
import type { CalendarEntry, MarketingChannel, SocialPlatform } from "../../types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const channelStyle: Record<MarketingChannel, string> = {
  sms: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  email: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  social: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
};

const platformDot: Record<SocialPlatform, string> = {
  linkedin: "bg-blue-500",
  x: "bg-slate-600",
  facebook: "bg-indigo-500",
  instagram: "bg-pink-500",
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function ContentCalendarPage() {
  const sms = useMarketingStore((s) => s.sms);
  const emails = useMarketingStore((s) => s.emails);
  const social = useMarketingStore((s) => s.social);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const entries = useMemo<CalendarEntry[]>(() => {
    const items: CalendarEntry[] = [];

    for (const campaign of social) {
      for (const post of campaign.posts) {
        items.push({
          id: post.id,
          date: post.scheduledAt.slice(0, 10),
          channel: "social",
          platform: post.platform,
          title: campaign.name,
          status: post.status,
          href: `/social-campaigns/${campaign.id}`,
        });
      }
    }

    for (const campaign of sms) {
      const date = (campaign.scheduledAt ?? campaign.sentAt)?.slice(0, 10);
      if (!date) continue;
      items.push({
        id: campaign.id,
        date,
        channel: "sms",
        title: campaign.name,
        status: campaign.status === "completed" || campaign.status === "running" ? "published" : "scheduled",
        href: `/sms-campaigns/${campaign.id}`,
      });
    }

    for (const campaign of emails) {
      const date = campaign.sentAt?.slice(0, 10);
      if (!date) continue;
      items.push({
        id: campaign.id,
        date,
        channel: "email",
        title: campaign.name,
        status: campaign.status === "completed" || campaign.status === "running" ? "published" : "scheduled",
        href: `/email-campaigns/${campaign.id}`,
      });
    }

    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [sms, emails, social]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const selectedKey = selected ?? toDateKey(new Date());
  const dayEntries = entries.filter((e) => e.date === selectedKey);
  const upcoming = entries.filter((e) => e.status === "scheduled").slice(0, 12);

  return (
    <div className="space-y-6 pb-8">
      <RoadmapBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Marketing</p>
          <h1 className="text-2xl font-bold">Content calendar</h1>
          <p className="text-sm text-muted-foreground">
            Cross-channel schedule for social posts, SMS drops, and email sends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-[160px] text-center text-sm font-semibold">{monthLabel}</p>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const key = toDateKey(new Date(year, month, day));
              const dayItems = entries.filter((e) => e.date === key);
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "min-h-[92px] rounded-lg border p-1.5 text-left transition-colors",
                    isSelected ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  <p className="text-xs font-medium">{day}</p>
                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-1 truncate">
                        {item.platform ? (
                          <span className={cn("size-1.5 shrink-0 rounded-full", platformDot[item.platform])} />
                        ) : null}
                        <span className="truncate text-[10px] text-muted-foreground">{item.title}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 ? (
                      <p className="text-[10px] text-muted-foreground">+{dayItems.length - 3} more</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selected day</CardTitle>
            <CardDescription>{new Date(selectedKey).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled items on this day.</p>
            ) : (
              dayEntries.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.platform ? platformLabels[item.platform] : item.channel.toUpperCase()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={channelStyle[item.channel]}>{item.channel}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Next scheduled drops across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-sm">{item.date}</TableCell>
                    <TableCell>
                      <Link to={item.href} className="text-sm font-medium hover:underline">{item.title}</Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={channelStyle[item.channel]}>{item.channel}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
