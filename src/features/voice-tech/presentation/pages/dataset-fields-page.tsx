import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useVoiceTechAttributes,
  useUpsertAttribute,
} from "../../api/voice-tech-queries";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import type { EntityAttribute } from "../../types";

const TENANT_ID = "tenant-ey-001";

const TYPE_LABELS: Record<string, string> = {
  enum: "Options",
  string: "Text",
  number: "Number",
  boolean: "Yes / No",
  date: "Date",
};

const TYPE_COLORS: Record<string, string> = {
  enum: "bg-violet-100 text-violet-700",
  string: "bg-sky-100 text-sky-700",
  number: "bg-amber-100 text-amber-700",
  boolean: "bg-emerald-100 text-emerald-700",
  date: "bg-rose-100 text-rose-700",
};

export function DatasetFieldsPage() {
  const { name } = useParams({ from: "/voice-tech/datasets/$name" }) as { name: string };
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("string");
  const [newValues, setNewValues] = useState("");

  const { data: attributes = [], isLoading: attrsLoading } = useVoiceTechAttributes(
    TENANT_ID,
    name
  );

  const upsertMutation = useUpsertAttribute(TENANT_ID, name);

  const handleAddAttribute = () => {
    if (!newKey) return;
    upsertMutation.mutate({
      key: newKey,
      type: newType,
      values: newType === 'enum' ? newValues.split(',').map(v => v.trim()).filter(Boolean) : undefined,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setNewKey("");
        setNewType("string");
        setNewValues("");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech/datasets">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dataset Fields</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Inspecting <span className="font-mono font-semibold text-foreground">"{name}"</span>
            </p>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5">
              <Plus className="size-4" />
              Add Custom Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Custom Attribute</DialogTitle>
              <DialogDescription>
                Define a new data field for the "{name}" dataset. This field will be available for routing rules.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key" className="text-sm font-semibold">Field Name (Key)</Label>
                <Input
                  id="key"
                  placeholder="e.g. customer_tier, preferred_language"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-semibold">Data Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="string">Text (String)</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Yes / No (Boolean)</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="enum">Options (Enum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newType === 'enum' && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="values" className="text-sm font-semibold">Enum Options</Label>
                  <Input
                    id="values"
                    placeholder="e.g. Gold, Silver, Bronze (comma separated)"
                    value={newValues}
                    onChange={(e) => setNewValues(e.target.value)}
                    className="rounded-xl h-11"
                  />
                  <p className="text-[10px] text-muted-foreground ml-1">
                    Enter values separated by commas. These will be available as options in routing rules.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddAttribute} 
                disabled={!newKey || upsertMutation.isPending}
                className="rounded-xl h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {upsertMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Save Attribute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Data Fields Inspector ───────────────────────── */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Inferred Schema</h3>
              <p className="text-xs text-muted-foreground">Automatic detection of data types</p>
            </div>
          </div>
          {!attrsLoading && attributes.length > 0 && (
            <Badge variant="outline" className="bg-background">
              {attributes.length} Attributes Detected
            </Badge>
          )}
        </div>
        <div className="p-6">
          {attrsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : attributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Tag className="size-12 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-semibold text-foreground">No fields detected</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try re-uploading the dataset or check if the CSV file is properly formatted.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attributes.map((attr: EntityAttribute) => (
                <div
                  key={attr.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {attr.key}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Field Key</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      TYPE_COLORS[attr.type] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {TYPE_LABELS[attr.type] || attr.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
