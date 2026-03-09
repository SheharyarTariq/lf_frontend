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
import Button from '@/components/common/Button'
import { validateForm } from '@/utils/validation'
import { areaNameSchema } from '../schema'

function AreaDetails() {
    const params = useParams()
    const searchParams = useSearchParams()
    const areaId = params["area-details"] as string
    const getareaName = searchParams.get("name") || ""
    const [areaName, setAreaName] = useState(getareaName)
    const [displayName, setDisplayName] = useState(getareaName)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleUpdateArea = async (): Promise<boolean> => {
        const validationErrors = await validateForm(areaNameSchema, { name: areaName });
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return false;
        }
        setLoading(true)
        const response = await apiCall({
            endpoint: routes.api.editArea(areaId),
            method: "PATCH",
            headers:{"content-type": "application/merge-patch+json"},
            data: { name: areaName },
            showSuccessToast: true,
            successMessage: "Area updated successfully",
        })
        setLoading(false)
        if (response.success) {
            setErrors({})
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
                        onChange={(e) => {
                            setAreaName(e.target.value);
                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                        }}
                        error={errors.name}
                    />
                </FormDialog>
            </div>

            <Slots areaId={areaId} />
            <Postcodes areaId={areaId}/>
            <div className='flex justify-end mt-6 mx-[30px]'>
                <Button
                className='bg-muted text-placeholder cursor-not-allowed rounded-md py-4 px-6 text-[20px] font-[500]'>
                ✕ Delete Area
                </Button>
            </div>
        </div>
    )
}

export default AreaDetails
