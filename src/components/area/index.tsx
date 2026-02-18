"use client"
import React from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { Plus } from 'lucide-react'
import AreaTable from './area-table'

function Area() {
    return (
        <>
            <div className='px-[50px] mt-[51px]'>
                <div className="flex items-center justify-between mb-8">
                    <h1 className='text-black text-[32px] font-[500]'>Areas</h1>

                </div>

                <div className='w-full flex items-center gap-[24px]'>
                    <Input
                        placeholder="Search Area"
                        search
                    />
                    <Button className="flex items-center gap-2">
                        <Plus size={20} />
                        Create
                    </Button>
                </div>
                <AreaTable />
            </div>
        </>
    )
}

export default Area