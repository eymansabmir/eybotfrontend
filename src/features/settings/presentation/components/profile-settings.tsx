import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib/utils";
import { sanitizeLabel, INPUT_LIMITS } from "@/lib/input-validation";

export function ProfileSettings() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (isPending) return <Spinner />;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      });
      
      if (error) throw error;
      
      await refetch();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(sanitizeLabel(e.target.value))}
                placeholder="Your name"
                maxLength={INPUT_LIMITS.NAME}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your email address is managed by your organization.
              </p>
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Spinner className="mr-2 size-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
