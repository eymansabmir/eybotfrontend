import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SmsDeliveryLogEntry } from "../../../types";

interface DeliveryLogTableProps {
  entries: SmsDeliveryLogEntry[];
  maxRows?: number;
}

const statusColors: Record<SmsDeliveryLogEntry["status"], string> = {
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  clicked: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

export function DeliveryLogTable({ entries, maxRows = 15 }: DeliveryLogTableProps) {
  const rows = entries.slice(0, maxRows);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>MSISDN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-mono text-sm">{entry.msisdn}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusColors[entry.status]}>
                  {entry.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>{entry.carrier}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {entry.errorCode ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
