// components/DataTable.tsx
// TanStack Table v8 + shadcn/ui
// - Sticky header, zebra-ready rows, soft borders
// - Sorting, global search (centered), pagination
// - Optional "No." column and row actions column

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
} from "lucide-react";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Shows a leading "No." column */
  showRowNumbers?: boolean;
  /** Optional actions column renderer (appears at the far right) */
  rowActions?: (row: TData) => React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** How many skeleton rows to show while loading */
  loadingRows?: number;
  /** Called when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Enable the search input */
  enableGlobalFilter?: boolean;
  /** Optional placeholder for search */
  searchPlaceholder?: string;
  /** External toolbar content on the right (e.g., Add button) */
  rightToolbar?: React.ReactNode;
  /** Initial page size */
  initialPageSize?: number;
  /** Page size choices */
  pageSizeOptions?: number[];
};

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    data,
    columns,
    showRowNumbers,
    rowActions,
    isLoading,
    loadingRows = 6,
    onRowClick,
    enableGlobalFilter = true,
    searchPlaceholder = "Search...",
    rightToolbar,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Compose visible columns: No. | provided | Actions
  const composedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    if (showRowNumbers) {
      cols.push({
        id: "_rownum",
        header: () => <div className="text-center">No.</div>,
        cell: ({ table, row }: { table: any, row: any }) => (
          <div className="text-center text-muted-foreground">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              row.index +
              1}
          </div>
        ),
        size: 60,
        enableSorting: false,
      } as unknown as ColumnDef<TData, TValue>);
    }

    cols.push(...columns);

    if (rowActions) {
      cols.push({
        id: "_actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }: { row: any }) => (
          // Prevent row onClick when interacting with actions
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            {rowActions(row.original)}
          </div>
        ),
        size: 120,
        enableSorting: false,
      } as unknown as ColumnDef<TData, TValue>);
    }

    return cols;
  }, [columns, showRowNumbers, rowActions]);

  const table = useReactTable({
    data,
    columns: composedColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
    globalFilterFn: (row, _columnId, filterValue) => {
      // Simple case-insensitive substring across all visible string values
      const v = String(Object.values(row.original || {}).join(" ")).toLowerCase();
      return v.includes(String(filterValue).toLowerCase());
    },
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1 pr-1">
        {/* Left spacer (kept for perfect centering) */}
        <div className="hidden sm:block" />

        {/* Centered search */}
        <div className="justify-self-center w-full sm:w-[360px]">
          {enableGlobalFilter && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search table"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Right-aligned toolbar (actions button / etc.) */}
        <div className="justify-self-end">{rightToolbar}</div>
      </div>

      {/* Table wrapper with sticky header */}
      <div className="rounded-xl border overflow-hidden shadow-md">
        <div className="relative max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead
                        key={header.id}
                        className={`whitespace-nowrap ${canSort ? "cursor-pointer select-none" : ""
                          }`}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <ArrowUpDown
                              className={`h-4 w-4 ${header.column.getIsSorted()
                                ? "opacity-100"
                                : "opacity-40"
                                }`}
                            />
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="bg-card">
              {isLoading ? (
                Array.from({ length: loadingRows }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="animate-pulse">
                    {table.getAllLeafColumns().map((c) => (
                      <TableCell key={`${c.id}-${i}`}>
                        <div className="h-4 w-[60%] rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`hover:bg-accent/50 ${onRowClick ? "cursor-pointer" : ""
                      }`}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllLeafColumns().length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (

          <div className="text-xs lg:text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
        ) : <div />}
        <div className="flex items-center gap-2">
          <span className="sr-only md:not-sr-only text-sm">Rows per page</span>
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                table.setPageIndex(table.getPageCount() - 1)
              }
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
