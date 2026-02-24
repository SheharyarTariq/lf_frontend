"use client"
import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import AreaTable from './area-table'
import apiCall from '@/components/common/utils/api-call'
import { routes } from '@/components/common/utils/routes'
import FormDialog from '../common/form-dailog'
import Input from '../common/Input'
import SearchInput from '../common/SearchInput'

interface AreaData {
    id: string;
    name: string;
    code: string;
    city: string;
    status: string;
}

interface AreaResponse {
    member: AreaData[];
}

interface CreateAreaResponse {
    id: string;
    name: string;
    code: string;
    city: string;
    status: string;
}

function Area() {
    const [areaResponse, setAreaResponse] = useState<AreaData[]>([])
    const [areaName, setAreaName] = useState('')
    const [loading, setLoading] = useState(false)

    const getArea = async () => {
        const response = await apiCall<AreaResponse>({
            endpoint: routes.api.getArea,
            method: "GET",
        })
        if (response.success && response.data?.member) {
            setAreaResponse(response.data.member)
        }
    }

    useEffect(() => {
        getArea()
    }, [])

    const handleCreateArea = async (): Promise<boolean> => {
        setLoading(true)
        const response = await apiCall<CreateAreaResponse>({
            endpoint: routes.api.getArea,
            method: "POST",
            data: { name: areaName },
            showSuccessToast: true,
            successMessage: "Area created successfully",
        })
        setLoading(false)
        if (response.success && response.data) {
            setAreaResponse((prev) => [...prev, response.data as AreaData])
            setAreaName('')
            return true
        }
        return false
    }

    const handleSearchResults = (data: AreaResponse | null) => {
        if (data && data.member) {
            setAreaResponse(data.member)
        } else {
            getArea()
        }
    }

    return (
        <>
            <div className='px-[50px] mt-[51px]'>
                <div className="flex items-center justify-between mb-8">
                    <h1 className='text-black text-[32px] font-[500]'>Areas</h1>
                </div>

                <div className='w-full flex items-center gap-[24px]'>
                    <SearchInput<AreaResponse>
                        endpoint={routes.api.getArea}
                        searchKey="name"
                        placeholder="Search Area"
                        onResults={handleSearchResults}
                    />
                    <FormDialog
                        title="Area Name"
                        buttonText={<span className="flex items-center gap-2 px-4 py-2"><Plus size={20} />Create</span>}
                        saveButtonText="Save"
                        onSubmit={handleCreateArea}
                        loading={loading}
                    >
                        <Input
                            placeholder="e.g. Arsenal"
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                            className=''
                        />
                    </FormDialog>
                </div>
                <AreaTable areaResponse={areaResponse} />
            </div>
        </>
    )
}

export default Area