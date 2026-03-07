"use client"
import React, { useState } from 'react'
import Slots from './slots'
import { useParams, useSearchParams } from 'next/navigation'
import BackArrow from '@/components/common/BackArrow'
import FormDialog from '@/components/common/form-dailog'
import Input from '@/components/common/Input'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import Postcodes from './postcodes'

function AreaDetails() {
    const params = useParams()
    const searchParams = useSearchParams()
    const areaId = params["area-details"] as string
    const getareaName = searchParams.get("name") || ""
    const [areaName, setAreaName] = useState(getareaName)
    const [displayName, setDisplayName] = useState(getareaName)
    const [loading, setLoading] = useState(false)

    const handleUpdateArea = async (): Promise<boolean> => {
        setLoading(true)
        const response = await apiCall({
            endpoint: routes.api.editArea(areaId),
            method: "PATCH",
            data: { name: areaName },
            showSuccessToast: true,
            successMessage: "Area updated successfully",
        })
        setLoading(false)
        if (response.success) {
            setDisplayName(areaName)
            return true
        }
        return false
    }

    return (
        <div className='px-[30px] py-[60px]'>
            <BackArrow
            />
            <div className='flex items-center justify-between mt-[20px] mx-[30px] mb-[30px]'>
                <p className='text-black text-[20px] font-[500] text-[32px] '>{displayName}</p>
                <FormDialog
                    title="Area Name"
                    buttonText="Edit Area"
                    saveButtonText="Save"
                    onSubmit={handleUpdateArea}
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

            <Slots areaId={areaId} />
            <Postcodes areaId={areaId}/>
        </div>
    )
}

export default AreaDetails