import React from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { Plus } from 'lucide-react'

function Users() {
    return (
        <div>
            <div className='px-[50px] mt-[51px]'>
                <h1 className='text-[32px] font-[500] text-black'>Users</h1>
                <div className='w-full flex items-center gap-[24px] mt-5'>
                    <Input placeholder="Search Users" search />
                    <div className='flex items-center relative'>
                        <Button className='flex gap-[10px]'>
                            <Plus size={20} />
                            Create
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Users
