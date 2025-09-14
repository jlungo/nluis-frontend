// components/DataTable.tsx
import * as React from "react";
import {
  ColumnDef,
  SortingState,
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showRowNumbers?: boolean;
  rowActions?: (row: TData) => React.ReactNode;
  isLoading?: boolean;
  loadingRows?: number;
  onRowClick?: (row: TData) => void;
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  rightToolbar?: React.ReactNode;
  initialPageSize?: number;
  pageSizeOptions?: number[];

  // NEW: server (manual) pagination support
  manualPagination?: boolean;
  pageCount?: number; // total pages from server
  pagination?: PaginationState; // controlled pagination state
  onPaginationChange?: (
    updater: PaginationState | ((old: PaginationState) => PaginationState)
  ) => void;
  rowCount?: number; // total rows from server (for "Showing x–y of z")
  /** Table has shadow */
  shadowed?: boolean;
  showPagination?: boolean;
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

    // NEW
    manualPagination = false,
    pageCount,
    pagination,
    onPaginationChange,
    rowCount,
    shadowed = true,
    showPagination = true
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Fallback internal pagination state if not controlled
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize,
    });

  const pag = pagination ?? internalPagination;
  const setPag =
    onPaginationChange ??
    ((updater: PaginationState | ((old: PaginationState) => PaginationState)) =>
      setInternalPagination((old) =>
        typeof updater === "function" ? (updater as any)(old) : updater
      ));

  // Compose visible columns: No. | provided | Actions
  const composedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    if (showRowNumbers) {
      cols.push({
        id: "_rownum",
        header: () => <div className="text-center">No.</div>,
        cell: ({ table, row }: { table: any; row: any }) => (
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

  // Build base config
  const config: any = {
    data,
    columns: composedColumns,
    state: { sorting, globalFilter, pagination: pag },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPag,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
    globalFilterFn: (row: any, _columnId: any, filterValue: any) => {
      const v = String(
        Object.values(row.original || {}).join(" ")
      ).toLowerCase();
      return v.includes(String(filterValue).toLowerCase());
    },
  };

  // Client vs Server pagination
  if (manualPagination) {
    config.manualPagination = true;
    config.pageCount = pageCount ?? 1;
    // Do NOT add getPaginationRowModel when manual
  } else {
    config.getPaginationRowModel = getPaginationRowModel();
  }

  const table = useReactTable(config);

  // Footer helpers
  const totalRows = rowCount ?? table.getFilteredRowModel().rows.length;
  const start = data.length ? pag.pageIndex * pag.pageSize + 1 : 0;
  const end = pag.pageIndex * pag.pageSize + data.length;
  const canPrev = pag.pageIndex > 0;
  const canNext = manualPagination
    ? pag.pageIndex + 1 < (pageCount ?? 1)
    : table.getCanNextPage();

  const goFirst = () => setPag((old) => ({ ...old, pageIndex: 0 }));
  const goPrev = () =>
    setPag((old) => ({ ...old, pageIndex: Math.max(0, old.pageIndex - 1) }));
  const goNext = () =>
    setPag((old) => ({
      ...old,
      pageIndex: manualPagination
        ? Math.min((pageCount ?? 1) - 1, old.pageIndex + 1)
        : old.pageIndex + 1,
    }));
  const goLast = () =>
    setPag((old) => ({ ...old, pageIndex: Math.max(0, (pageCount ?? 1) - 1) }));

  const changePageSize = (size: number) =>
    setPag(() => ({ pageIndex: 0, pageSize: size }));

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 xl:justify-between">

        {/* Centered search */}
        <div className="justify-self-end w-full sm:w-[360px] md:w-[500px]">
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
        {rightToolbar && <div className="justify-self-end">{rightToolbar}</div>}
      </div>

      {/* Table wrapper with sticky header */}
      <div className={`rounded-xl border overflow-hidden ${shadowed ? 'shadow-md' : ''}`}>
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
                      onRowClick
                        ? () => onRowClick(row.original as TData)
                        : undefined
                    }
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="dark:text-muted-foreground">
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
      {showPagination ? (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {totalRows ? (
              <>
                Showing <span className="font-medium">{start}</span>–
                <span className="font-medium">{end}</span> of{" "}
                <span className="font-medium">{totalRows}</span>
              </>
            ) : (
              "No rows"
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={`${pag.pageSize}`} onValueChange={(e) => changePageSize(Number(e))}>
              <SelectTrigger>
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => <SelectItem key={size} value={`${size}`}>{size} <span className="hidden sm:inline text-sm">rows per page</span></SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={goFirst}
                disabled={!canPrev}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                disabled={!canPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                disabled={!canNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goLast}
                disabled={manualPagination ? !canNext : !table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
