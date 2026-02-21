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
    { header: 'Area Code', accessor: 'code' },
    { header: 'City', accessor: 'city' },
    { header: 'Status', accessor: 'status' },
];

const data: AreaData[] = [
    { id: '1', name: 'Downtown', code: 'DT-001', city: 'New York', status: 'Active' },
    { id: '2', name: 'Uptown', code: 'UP-002', city: 'New York', status: 'Inactive' },
    { id: '3', name: 'Midtown', code: 'MT-003', city: 'New York', status: 'Active' },
    { id: '4', name: 'West Side', code: 'WS-004', city: 'New York', status: 'Pending' },
];

function AreaTable() {
    return (
        <>
            <div className='mt-[30px]'>
                <GenericTable columns={columns} data={data} />
            </div>
        </>
    )
}

export default AreaTable