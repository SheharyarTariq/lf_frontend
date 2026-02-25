import React from 'react'
import GenericTable, { Column } from '@/components/common/GenericTable'

interface AreaData {
    id: string;
    name: string;
    code: string;
    city: string;
    status: string;
}

const columns: Column<AreaData>[] = [
    { header: 'Area Name', accessor: 'name' },
    {
        header: 'Action',
        accessor: () => (
            <div className="flex justify-end">
                <img src="/assets/ArrowRight.svg" alt="" className="cursor-pointer" />
            </div>
        ),
        className: 'text-right pr-[25px]'
    },
];

function AreaTable({ areaResponse }: { areaResponse: AreaData[] }) {
    return (
        <>
            <div className='mt-[30px]'>
                <GenericTable columns={columns} data={areaResponse} />
            </div>
        </>
    )
}

export default AreaTable