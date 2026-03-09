"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../common/Input'
import { Plus } from 'lucide-react'
import GenericTable, { Column } from '@/components/common/GenericTable'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import FormDialog from '../common/form-dailog'
import { validateForm } from '@/utils/validation'
import { categorySchema } from './schema'

interface ItemCategory {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  name: string;
  washingLabel: string;
  position?: number;
}

interface ItemCategoriesResponse {
  totalItems: number;
  member: ItemCategory[];
}

function Category() {
  const router = useRouter()
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createData, setCreateData] = useState<{ name: string, position?: number }>({ name: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getCategories = async () => {
    setIsLoading(true)
    const response = await apiCall<ItemCategoriesResponse>({
      endpoint: routes.api.getItemCategories,
      method: "GET",
      headers: { "Accept": "application/ld+json" },
    })
    if (response.success && response?.data) {
      setCategories(response.data.member.map((item, index) => ({
        ...item,
        position: index + 1,
      })))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getCategories()
  }, [])

  const handleCreate = async () => {
    const validationErrors = await validateForm(categorySchema, {
      name: createData.name,
      position: createData.position,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    try {
      const response = await apiCall({
        endpoint: routes.api.createItemCategory,
        method: "POST",
        data: createData,
        showSuccessToast: true,
        successMessage: "Category Created Successfully"
      });
      if (response.success) {
        setErrors({});
        setCreateData({ name: '' });
        getCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create category", error);
      return false;
    }
  }

  const columns: Column<ItemCategory>[] = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Position',
      accessor: 'position' as keyof ItemCategory,
      render: (item) => (
        <div className="w-[30px] h-[30px] flex items-center justify-center bg-muted rounded-md text-[18px]">
          {item.position}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: () => (
        <div className="flex justify-end">
          <img src="/assets/ArrowRight.svg" alt="" className="cursor-pointer" />
        </div>
      ),
      className: 'text-right pr-[25px]'
    },
  ]

  return (
    <div>
      <div className='px-[50px] mt-[51px] mb-10'>
        <h1 className='text-[32px] font-[500] text-black'>Category</h1>
        <div className='w-full flex items-center gap-[24px] mt-5'>
          <Input placeholder="Search" search />
          <div className='flex items-center relative'>
            <FormDialog
              title="Create New Category"
              buttonText={
                <div className='flex gap-[10px] items-center text-[16px]'>
                  <Plus size={20} />
                  Create
                </div>
              }
              saveButtonText="Save"
              onSubmit={handleCreate}
              triggerVariant="primary"
            >
              <div className="flex flex-col gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-black">Name</label>
                  <Input
                    placeholder="e.g. Curtains"
                    value={createData.name}
                    onChange={(e) => {
                      setCreateData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    error={errors.name}
                  />
                </div>
                <div className="flex flex-col gap-2 w-[150px]">
                  <label className="text-[14px] font-medium text-black">Position</label>
                  <Input
                    type="number"
                    placeholder="1"
                    min={1}
                    value={createData.position ?? ''}
                    onChange={(e) => {
                      setCreateData(prev => ({ ...prev, position: e.target.value ? Number(e.target.value) : undefined }));
                      if (errors.position) setErrors(prev => ({ ...prev, position: '' }));
                    }}
                    error={errors.position}
                  />
                </div>
              </div>
            </FormDialog>
          </div>
        </div>
        <div className='mt-[30px]'>
          <GenericTable
            columns={columns}
            data={categories}
            isLoading={isLoading}
            onRowClick={(row) => router.push(`${routes.ui.categoryDetails(row.id)}?name=${encodeURIComponent(row.name)}`)}
          />
        </div>
      </div>
    </div>
  )
}

export default Category
