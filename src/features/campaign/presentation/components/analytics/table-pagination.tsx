import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemLabel = "items",
}: TablePaginationProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-6 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
            <span className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{start}</span> to{" "}
                <span className="font-medium text-foreground">{end}</span> of{" "}
                <span className="font-medium text-foreground">{totalItems}</span> {itemLabel}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[80px] text-center">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
