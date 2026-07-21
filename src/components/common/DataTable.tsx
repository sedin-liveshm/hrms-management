import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T extends object> {
  key: keyof T | string;
  label: string;
  renderCell?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your filters or search query.",
  className,
  onRowClick,
}: DataTableProps<T>) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("w-full overflow-auto rounded-xl", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  col.align ? alignClass[col.align] : "text-left"
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`} className="border-border">
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && data.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-48 p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            data.map((row) => (
              <TableRow
                key={String(row[rowKey])}
                className={cn(
                  "border-border transition-colors",
                  onRowClick &&
                    "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn(
                      "text-sm",
                      col.align ? alignClass[col.align] : "text-left"
                    )}
                  >
                    {col.renderCell
                      ? col.renderCell(row)
                      : String(row[col.key as keyof T] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
