import React from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

export interface GenericTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    className?: string;
}

function GenericTable<T>({ columns, data, onRowClick, className = "" }: GenericTableProps<T>) {
    const renderCell = (row: T, column: Column<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor as keyof T] as React.ReactNode;
    };

    return (
        <div className={`overflow-x-auto border border-muted rounded-[14px] ${className}`}>
            <table className="min-w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-muted">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`py-[16px] px-[25px] font-[500] text-neutral ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`border-b border-muted hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
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
        </div>
    );
}

export default GenericTable;