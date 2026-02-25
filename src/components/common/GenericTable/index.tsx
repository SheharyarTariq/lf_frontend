"use client"
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
}

export interface GenericTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    className?: string;
    pageSize?: number;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: string;
    direction: SortDirection;
}

function GenericTable<T>({ columns, data, onRowClick, className = "", pageSize = 10 }: GenericTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const handleSort = (accessor: keyof T) => {
        const key = accessor as string;
        setSortConfig((prev) => {
            if (prev && prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
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
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
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
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor as keyof T] as React.ReactNode;
    };

    const isSortable = (column: Column<T>) => {
        return typeof column.accessor !== 'function' && column.sortable !== false;
    };

    return (
        <div className={`overflow-x-auto border border-muted rounded-[14px] ${className}`}>
            <table className="min-w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-muted">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`py-[16px] px-[25px] font-[500] text-black  ${isSortable(column) ? 'cursor-pointer select-none' : ''} ${column.className || ''}`}
                                onClick={() => isSortable(column) && handleSort(column.accessor as keyof T)}
                            >
                                {isSortable(column) ? (
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {sortConfig?.key === (column.accessor as string) ? (
                                            sortConfig.direction === 'asc'
                                                ? <ArrowUp size={16} className="text-neutral" />
                                                : <ArrowDown size={16} className="text-neutral" />
                                        ) : (
                                            <ArrowDown size={16} className="text-neutral opacity-40" />
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
                    {paginatedData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`border-b border-muted hover:bg-gray-50 transition-colors cursor-pointer ${onRowClick ? 'cursor-pointer' : ''}`}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`py-[16px] px-[25px] text-black ${column.className || ''}`}
                                >
                                    {renderCell(row, column)}
                                </td>
                            ))}
                        </tr>
                    ))}
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