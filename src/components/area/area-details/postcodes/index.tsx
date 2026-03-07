import React, { useEffect, useState } from 'react'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import Card from '@/components/common/Card'
import GenericTable from '@/components/common/GenericTable'
import Image from 'next/image'
import FormDialog from '@/components/common/form-dailog'
import Input from '@/components/common/Input'

interface Postcode {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  postcodeString: string;
  isActive: boolean;
}

const getPostcodeId = (postcode: Postcode): string => {
  return postcode["@id"]?.split("/").pop() || ""
}

interface PostcodesData {
  totalItems: number;
  member: Postcode[];
}

function Postcodes({ areaId }: { areaId: string }) {
  const [postcodes, setPostcodes] = useState<Postcode[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newPostcode, setNewPostcode] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  const getPostcodes = async () => {
    const response = await apiCall<PostcodesData>({
      endpoint: routes.api.getPostcodes(areaId),
      method: "GET",
    })
    if (response.success && response?.data) {
      setPostcodes(response.data.member)
    }
  }

  const handleToggle = async (postcodeId: string, isActive: boolean) => {
    const endpoint = isActive
      ? routes.api.markPostcodeInactive(postcodeId)
      : routes.api.markPostcodeActive(postcodeId)

    const response = await apiCall({
      endpoint,
      method: "POST",
      data: {},
      showSuccessToast: true,
    })

    if (response.success) {
      await getPostcodes()
    }
  }

  const handleDelete = async (postcodeId: string): Promise<boolean> => {
    const response = await apiCall({
      endpoint: `postcodes/${postcodeId}`,
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Postcode deleted successfully",
    })
    if (response.success) {
      await getPostcodes()
      return true
    }
    return false
  }

  const handleCreatePostcode = async (): Promise<boolean> => {
    setCreateLoading(true)
    const response = await apiCall({
      endpoint: routes.api.createPostcode,
      method: "POST",
      data: {
        postcodeString: newPostcode,
        area: `/areas/${areaId}`,
        isActive: true,
      },
      showSuccessToast: true,
      successMessage: "Postcode created successfully",
    })
    setCreateLoading(false)
    if (response.success) {
      setNewPostcode("")
      await getPostcodes()
      return true
    }
    return false
  }

  useEffect(() => {
    getPostcodes()
  }, [])

  const filteredPostcodes = postcodes.filter((p) =>
    p.postcodeString.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='mt-[30px]'>
      <Card>
        <h2 className='text-black font-[500] text-[24px] mb-[25px]'>Postcodes</h2>
        <div className='flex items-center justify-between mb-[30px] gap-[20px]'>
          <Input
            search
            placeholder="Search Postcode"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormDialog
            title="Add Postcode"
            buttonText="+ Add Postcode"
            saveButtonText="Save"
            onSubmit={handleCreatePostcode}
            loading={createLoading}
          >
            <div className="flex flex-col gap-[20px]">
              <div>
                <label className="text-black font-[500] text-[14px] mb-[8px] block">Postcode</label>
                <Input
                  placeholder="e.g. KT211PG"
                  value={newPostcode}
                  onChange={(e) => setNewPostcode(e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </FormDialog>
        </div>
        <GenericTable
          data={filteredPostcodes}
          columns={[
            { accessor: "postcodeString", header: "Postcode" },
            {
              accessor: (row) => (
                <div className="flex items-center gap-[16px] justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(getPostcodeId(row), row.isActive);
                    }}
                    className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 cursor-pointer ${row.isActive ? 'bg-[#34C759]' : 'bg-[#D1D5DB]'}`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow transition-transform duration-200 ${row.isActive ? 'translate-x-[20px]' : 'translate-x-0'}`}
                    />
                  </button>
                  {row.isActive ? (
                    <span className="p-[6px] opacity-100 pointer-events-none cursor-not-allowed">
                      <Image src="/assets/TrashDisabled.svg" alt="Delete disabled" width={30} height={30} />
                    </span>
                  ) : (
                    <FormDialog
                      title="Delete Postcode"
                      buttonText={
                        <Image src="/assets/TrashEnabled.svg" alt="Delete" width={30} height={30} />
                      }
                      saveButtonText="Yes"
                      onSubmit={() => handleDelete(getPostcodeId(row))}
                      triggerVariant="icon"
                      submitVariant="delete"
                    >
                      Are you sure you want to delete this Postcode?
                      <span className="mt-[8px] block">This action cannot be undone.</span>
                    </FormDialog>
                  )}
                </div>
              ),
              header: "Action",
              className: "text-right",
              sortable: false,
              isAction: true,
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Postcodes