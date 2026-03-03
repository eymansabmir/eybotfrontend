import { Link } from "@tanstack/react-router";
import { Plus, ArrowRight, Bot, Clock, User2, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBots } from "../../data/queries/use-bots";
import { formatDistanceToNow } from "date-fns";

export function BotsPage() {
  const { data: bots, isLoading, error } = useBots();

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive font-medium">Failed to load bots.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Bots</h1>
          <p className="text-muted-foreground">
            Manage and deploy your conversational AI agents.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link to="/bot/$id" params={{ id: "new" }}>
            <Plus className="size-4" />
            Create New Bot
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* Empty state / CTA Card */}
        <Link to="/bot/$id" params={{ id: "new" }} className="group h-full">
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/10 p-6 transition-all hover:bg-muted/20 hover:border-primary/50">
            <div className="rounded-full bg-background p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-muted-foreground group-hover:text-primary">New Bot</p>
              <p className="text-[11px] text-muted-foreground">Create a fresh conversational agent</p>
            </div>
          </div>
        </Link>

        {(bots || []).map((bot) => (
          <Link key={bot._id} to="/bot/$id" params={{ id: bot._id }} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/30 relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant={bot.status === "published" ? "secondary" : "outline"} className="capitalize">
                  {bot.status}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Bot className="size-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors truncate pr-16">{bot.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 font-bold">
                    {bot.triggerType}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>Updated {formatDistanceToNow(new Date(bot.updatedAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User2 className="size-3.5" />
                    <span>By {bot.updatedBy || "System"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="size-3.5" />
                    <span>{bot.executions?.toLocaleString() || 0} executions</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 border-t bg-muted/30 group-hover:bg-primary/5 transition-colors">
                <div className="w-full flex items-center justify-between pt-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Edit Flow</span>
                  <div className="rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground p-1 transition-all duration-300">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
