'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, ArrowUpDown, ChevronUp } from 'lucide-react';
import { TableToolbar } from './TableToolbar';
import { TablePagination } from './TablePagination';
import { TableBulkActions, BulkAction } from './TableBulkActions';
import { TableLoadingState } from './TableLoadingState';
import { TableEmptyState } from './TableEmptyState';

interface EnterpriseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  lang: 'en' | 'ar';
  
  // Selection
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  bulkActions?: BulkAction<TData>[];

  // Search & Filters
  enableSearch?: boolean;
  searchPlaceholder?: string;
  filterOptions?: {
    columnId: string;
    label: string;
    options: { label: string; value: string }[];
  }[];

  // Column Visibility
  enableColumnVisibility?: boolean;

  // Row Expansion
  renderSubComponent?: (props: { row: any }) => React.ReactNode;
  
  // Sticky header and height settings
  stickyHeader?: boolean;
  maxHeight?: string;

  // Table Density
  defaultDensity?: 'compact' | 'normal' | 'spacious';

  // Row selection/interaction click
  onRowClick?: (row: TData) => void;
}

export function EnterpriseTable<TData>({
  data,
  columns: userColumns,
  isLoading = false,
  emptyMessage,
  emptySubMessage,
  lang,
  enableSelection = false,
  onSelectionChange,
  bulkActions = [],
  enableSearch = true,
  searchPlaceholder,
  filterOptions = [],
  enableColumnVisibility = true,
  renderSubComponent,
  stickyHeader = true,
  maxHeight = 'max-h-[600px]',
  defaultDensity = 'normal',
  onRowClick,
}: EnterpriseTableProps<TData>) {
  const isRtl = lang === 'ar';
  const formatText = (en: string, ar: string) => (isRtl ? ar : en);

  // 1. Dynamic Columns Construction (prepends check & expander columns if active)
  const columns = useMemo(() => {
    const finalCols = [...userColumns];

    // If expander subcomponent is specified, prepend expander toggle column
    if (renderSubComponent) {
      const expanderCol: ColumnDef<TData> = {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label={formatText('Toggle expand row', 'تبديل توسيع الصف')}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              )}
            </button>
          ) : null;
        },
        enableSorting: false,
        enableHiding: false,
      };
      finalCols.unshift(expanderCol);
    }

    // If checkbox selection is active, prepend checkbox column
    if (enableSelection) {
      const selectCol: ColumnDef<TData> = {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              ref={(ref) => {
                if (ref) {
                  ref.indeterminate = table.getIsSomePageRowsSelected();
                }
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="w-4 h-4 rounded border-slate-350 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              className="w-4 h-4 rounded border-slate-350 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      };
      finalCols.unshift(selectCol);
    }

    return finalCols;
  }, [userColumns, enableSelection, renderSubComponent, lang]);

  // 2. States for TanStack hook
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>(defaultDensity);

  // 3. TanStack Table Initialization
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => !!renderSubComponent,
  });

  // 4. Fire selection callback
  const selectedRowsRef = useRef<TData[]>([]);
  useEffect(() => {
    if (onSelectionChange) {
      const currentSelected = table.getSelectedRowModel().rows.map((row) => row.original);
      const isChanged =
        currentSelected.length !== selectedRowsRef.current.length ||
        currentSelected.some((item, i) => item !== selectedRowsRef.current[i]);
      if (isChanged) {
        selectedRowsRef.current = currentSelected;
        onSelectionChange(currentSelected);
      }
    }
  }, [rowSelection, table, onSelectionChange]);

  // 5. Reset selection if data length resets or changes
  useEffect(() => {
    table.resetRowSelection();
  }, [data, table]);

  // 6. Cell & Row Density Styling Computations
  const getCellPadding = (d: 'compact' | 'normal' | 'spacious') => {
    switch (d) {
      case 'compact':
        return 'py-2 px-3 text-[11px] leading-relaxed';
      case 'spacious':
        return 'py-4.5 px-6 text-sm';
      case 'normal':
      default:
        return 'py-3 px-4 text-xs';
    }
  };

  const getHeaderPadding = (d: 'compact' | 'normal' | 'spacious') => {
    switch (d) {
      case 'compact':
        return 'py-2 px-3 text-[10px] tracking-wider';
      case 'spacious':
        return 'py-4 px-6 text-xs tracking-wider';
      case 'normal':
      default:
        return 'py-3.5 px-4 text-[10.5px] tracking-wider';
    }
  };

  const headerRows = table.getHeaderGroups();
  const bodyRows = table.getRowModel().rows;
  const visibleColumnsCount = table.getVisibleLeafColumns().length;

  return (
    <div className="relative flex flex-col w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-visible">
      {/* Toolbar controls */}
      <TableToolbar
        table={table}
        lang={lang}
        enableSearch={enableSearch}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filterOptions={filterOptions}
        enableColumnVisibility={enableColumnVisibility}
        density={density}
        setDensity={setDensity}
      />

      {/* Main Table Scroll Container */}
      <div className={`w-full overflow-x-auto select-text ${maxHeight} scrollbar-thin`}>
        <table className="w-full text-left border-collapse rtl:text-right">
          <thead className={stickyHeader ? 'sticky top-0 z-20' : ''}>
            {headerRows.map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-[inset_0_-1px_0_0_rgba(226,232,240,1)] dark:shadow-[inset_0_-1px_0_0_rgba(30,41,59,1)]"
              >
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`font-bold text-slate-400 dark:text-slate-500 uppercase font-mono select-none ${
                        isSortable ? 'cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-850/50 transition-colors' : ''
                      } ${getHeaderPadding(density)}`}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      style={{ width: header.column.columnDef.size }}
                    >
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        
                        {isSortable && (
                          <span className="shrink-0 transition-all duration-200">
                            {sortState === 'desc' && (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            {sortState === 'asc' && (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            {!sortState && (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumnsCount} className="p-0">
                  <TableLoadingState columnsCount={visibleColumnsCount - (enableSelection ? 1 : 0)} rowsCount={5} />
                </td>
              </tr>
            ) : bodyRows.length > 0 ? (
              bodyRows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => onRowClick?.(row.original)}
                      className={`group hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${
                        isSelected ? 'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/45 dark:hover:bg-blue-950/15' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`font-semibold text-slate-700 dark:text-slate-300 ${getCellPadding(
                            density
                          )}`}
                          style={{ width: cell.column.columnDef.size }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {/* Sub-row expansion node */}
                    {row.getIsExpanded() && renderSubComponent && (
                      <tr className="bg-slate-50/30 dark:bg-slate-900/20">
                        <td colSpan={visibleColumnsCount} className="p-0 border-t border-slate-100 dark:border-slate-800">
                          <div className="px-6 py-4.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            {renderSubComponent({ row })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleColumnsCount} className="p-0">
                  <TableEmptyState
                    message={emptyMessage}
                    subMessage={emptySubMessage}
                    lang={lang}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer bar */}
      {!isLoading && bodyRows.length > 0 && (
        <TablePagination table={table} lang={lang} />
      )}

      {/* Selection floating action bar */}
      {enableSelection && bulkActions.length > 0 && (
        <TableBulkActions table={table} actions={bulkActions} lang={lang} />
      )}
    </div>
  );
}
