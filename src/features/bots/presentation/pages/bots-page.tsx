import { useNavigate } from "@tanstack/react-router";
import { Plus, ArrowRight, Bot, Clock, User2, MessageSquare, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBots, useDeleteBot, useUpdateBot } from "../../data/queries/use-bots";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Bot as BotType } from "../../data/schemas/bot.schema";
import { CreateBotDialog } from "../components/create-bot-dialog";


import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BotActionsMenuProps {
  bot: BotType;
}

function BotActionsMenu({ bot }: BotActionsMenuProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(bot.name);

  // Keep rename state in sync with external updates
  useEffect(() => {
    setNewName(bot.name);
  }, [bot.name]);

  const updateBot = useUpdateBot(bot.id);
  const deleteBot = useDeleteBot();

  const handleRename = async () => {
    if (!newName.trim() || newName === bot.name) {
      setIsRenameOpen(false);
      return;
    }

    try {
      await updateBot.mutateAsync({ name: newName });
      toast.success("Bot renamed successfully");
      setIsRenameOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to rename bot");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBot.mutateAsync(bot.id);
      toast.success("Bot deleted successfully");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete bot");
    }
  };

  const isPublished = bot.status === 'published';

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="w-full">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRenameOpen(true);
                  }}
                  disabled={isPublished}
                >
                  <Pencil className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {isPublished && (
              <TooltipContent side="left">
                <p className="text-xs">Archive bot to rename</p>
              </TooltipContent>
            )}
          </Tooltip>

          <DropdownMenuSeparator />

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="w-full">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDeleteOpen(true);
                  }}
                  disabled={isPublished}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {isPublished && (
              <TooltipContent side="left">
                <p className="text-xs text-destructive">Archive bot to delete</p>
              </TooltipContent>
            )}
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename Bot</DialogTitle>
            <DialogDescription>
              Enter a new name for your conversational agent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={updateBot.isPending}>
              {updateBot.isPending ? "Renaming..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bot
              <strong> {bot.name} </strong> and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBot.isPending}
            >
              {deleteBot.isPending ? "Deleting..." : "Delete Bot"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

export function BotsPage() {
  const { data: bots, isLoading, error } = useBots();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);


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
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" />
          Create New Bot
        </Button>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Empty state / CTA Card */}
        <div
          onClick={() => setIsCreateDialogOpen(true)}
          className="group h-full cursor-pointer"
        >
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/10 p-6 transition-all hover:bg-muted/20 hover:border-primary/50">
            <div className="rounded-full bg-background p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-muted-foreground group-hover:text-primary">New Bot</p>
              <p className="text-[11px] text-muted-foreground">Create a fresh conversational agent</p>
            </div>
          </div>
        </div>


        {(bots || []).map((bot) => (
          <div key={bot.id} className="relative group">
            <Card
              className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/30 relative overflow-hidden group-hover:-translate-y-1"
              onClick={() => navigate({ to: "/bot/$id", params: { id: bot.id } })}
            >
              <div
                className="absolute top-4 right-4 flex items-center gap-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Badge variant={bot.status === "published" ? "secondary" : "outline"} className="capitalize">
                  {bot.status}
                </Badge>
                <BotActionsMenu bot={bot} />
              </div>

              <CardHeader className="pb-3">
                <div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Bot className="size-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors truncate pr-24">{bot.name}</CardTitle>
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
          </div>
        ))}
      </div>
      <CreateBotDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

