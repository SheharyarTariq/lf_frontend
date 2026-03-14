"use client";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: keyof T;
  isAction?: boolean;
}

export interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  pageSize?: number;
  isLoading?: boolean;
}

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: string;
  direction: SortDirection;
}

import Loader from "../Loader";

function GenericTable<T>({
  columns,
  data,
  onRowClick,
  className = "",
  pageSize = 10,
  isLoading,
}: GenericTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const getSortKey = (column: Column<T>): string => {
    if (column.sortKey) return column.sortKey as string;
    return column.accessor as string;
  };

  const handleSort = (column: Column<T>) => {
    const key = getSortKey(column);
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(0);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => {
      const aVal = a[key as keyof T];
      const bVal = b[key as keyof T];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderCell = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row);
    }
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor as keyof T] as React.ReactNode;
  };

  const isSortable = (column: Column<T>) => {
    if (column.sortable === true) return true;
    return typeof column.accessor !== "function" && column.sortable !== false;
  };

  const hasActionColumn = columns.some((col) => col.isAction);

  return (
    <div
      className={cn("overflow-x-auto border border-muted rounded-[14px]", className)}
    >
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-muted">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "py-[16px] px-[25px] font-[500] text-black",
                  hasActionColumn && !column.isAction ? "w-[1%] whitespace-nowrap" : "",
                  isSortable(column) ? "cursor-pointer select-none" : "",
                  column.className
                )}
                onClick={() => isSortable(column) && handleSort(column)}
              >
                {isSortable(column) ? (
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortConfig?.key === getSortKey(column) ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp size={16} className="text-silver" />
                      ) : (
                        <ArrowDown size={16} className="text-silver" />
                      )
                    ) : (
                      <ArrowDown size={16} className="text-silver" />
                    )}
                  </div>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center">
                <div className="flex items-center justify-center">
                  <Loader size={32} className="text-gray-400" />
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "border-b border-muted hover:bg-gray-50 transition-colors",
                  onRowClick ? "cursor-pointer" : ""
                )}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "py-[16px] px-[25px] text-black",
                      hasActionColumn && !column.isAction ? "w-[1%] whitespace-nowrap text-center" : "",
                      column.className
                    )}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalItems > pageSize && (
        <div className="flex items-center justify-end gap-4 py-[14px] px-[25px]">
          <span className="text-[14px] text-black">
            {startIndex + 1}-{endIndex} of {totalItems}
          </span>
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-black hover:bg-muted rounded-lg px-2 py-1 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-black hover:bg-muted rounded-lg px-2 py-1 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default GenericTable;
