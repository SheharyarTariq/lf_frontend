import React, { useEffect, useState } from 'react'
import Input from '@/components/common/Input'
import FormDialog from '@/components/common/form-dailog'
import SearchInput from '@/components/common/SearchInput'
import Select from '@/components/common/Select'
import GenericTable, { Column } from '@/components/common/GenericTable'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import { Plus } from 'lucide-react'

interface CategoryItem {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id: string;
    name: string;
    priceDryCleaning: number | null;
    priceWashing: number | null;
    priceType: string;
    piece: number;
    position?: number;
}

interface CategoryDetailsResponse {
    totalItems: number;
    search?: any;
    member: CategoryItem[];
}

interface ItemsTableProps {
    categoryId: string;
    onItemsChange?: (items: CategoryItem[]) => void;
}

function ItemsTable({ categoryId, onItemsChange }: ItemsTableProps) {
    const [items, setItems] = useState<CategoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreatingItem, setIsCreatingItem] = useState(false)
    const [isDeletingItem, setIsDeletingItem] = useState(false)
    const [deleteItemId, setDeleteItemId] = useState<string>("")
    const [createItemData, setCreateItemData] = useState<{
        name: string,
        priceWashing?: string,
        priceDryCleaning?: string,
        priceType: string,
        position?: number
    }>({
        name: '',
        priceType: 'Fixed'
    })

    const handleCreateItem = async (): Promise<boolean> => {
        setIsCreatingItem(true)
        const payload = {
            name: createItemData.name,
            priceWashing: createItemData.priceWashing ? Number(createItemData.priceWashing) : null,
            priceDryCleaning: createItemData.priceDryCleaning ? Number(createItemData.priceDryCleaning) : null,
            priceType: createItemData.priceType.toLowerCase(),
            position: createItemData.position ? Number(createItemData.position) : undefined,
            category: `/item-categories/${categoryId}`
        }

        const response = await apiCall({
            endpoint: routes.api.createItems,
            method: "POST",
            data: payload,
            showSuccessToast: true,
            successMessage: "Item added successfully",
        })
        console.log("Create Item API Response:", response)
        setIsCreatingItem(false)
        if (response.success) {
            setCreateItemData({ name: '', priceType: 'Fixed' })
            fetchItems()
            return true
        }
        return false
    }

    const handleDeleteItem = async (): Promise<boolean> => {
        setIsDeletingItem(true)
        const response = await apiCall({
            endpoint: routes.api.deleteItems(deleteItemId),
            method: "DELETE",
            showSuccessToast: true,
            successMessage: "Item deleted successfully",
        })
        setIsDeletingItem(false)
        if (response.success) {
            fetchItems()
            return true
        }
        return false
    }

    const fetchItems = async () => {
        setLoading(true)
        const response = await apiCall<CategoryDetailsResponse>({
            endpoint: routes.api.getItemCategoryDetails(categoryId),
            method: "GET",
            headers: { "Accept": "application/ld+json" },
        })

        if (response.success && response.data) {
            setItems(response.data.member)
            onItemsChange?.(response.data.member)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (categoryId) {
            fetchItems()
        }
    }, [categoryId])

    const formatPrice = (price?: number | null) => {
        if (price === null || price === undefined) return "-"
        return `£${price.toFixed(2)}`
    }

    const columns: Column<CategoryItem>[] = [
        {
            header: 'Item Name',
            accessor: 'name',
        },
        {
            header: 'Wash',
            accessor: (item) => formatPrice(item.priceWashing),
        },
        {
            header: 'Dry Clean',
            accessor: (item) => formatPrice(item.priceDryCleaning),
        },
        {
            header: 'Price Type',
            accessor: (item) => <span className="capitalize">{item.priceType}</span>,
        },
        {
            header: 'Position',
            accessor: 'position' as keyof CategoryItem,
            render: (item) => (
                <div className="w-[30px] h-[30px] flex items-center justify-center bg-muted rounded-md text-[14px]">
                    {item.position}
                </div>
            ),
        },
        {
            header: 'Action',
            accessor: (item) => (
                <div className="flex justify-end pr-[25px]" onClick={() => setDeleteItemId(item.id)}>
                    <FormDialog
                        title="Delete Item"
                        buttonText={<img src="/assets/TrashEnabled.svg" alt="Delete" className="cursor-pointer" />}
                        saveButtonText="Yes"
                        onSubmit={handleDeleteItem}
                        loading={isDeletingItem}
                        triggerVariant="icon"
                        submitVariant="delete"
                    >
                        Are you sure you want to delete this item?
                        <span className="mt-[8px] block">This action cannot be undone.</span>
                    </FormDialog>
                </div>
            ),
            className: 'text-right'
        },
    ]

    return (
        <div className='border border-[#EAEAEA] rounded-[16px] p-6 bg-white shadow-sm mt-4'>
            <div className='w-full flex items-center gap-[24px] mb-6'>
                <div className="flex-1">
                    <SearchInput<CategoryDetailsResponse>
                        endpoint={routes.api.getItemCategoryDetails(categoryId)}
                        searchKey="name"
                        placeholder="Search Items"
                        onResults={(data) => {
                            if (data) {
                                setItems(data.member)
                                onItemsChange?.(data.member)
                            } else {
                                fetchItems()
                            }
                        }}
                    />
                </div>
                <div className='flex items-center'>
                    <FormDialog
                        title="Add New Item"
                        buttonText={
                            <div className='flex gap-[10px] items-center text-[16px]'>
                                <Plus size={20} />
                                Add Items
                            </div>
                        }
                        saveButtonText="Save"
                        onSubmit={handleCreateItem}
                        loading={isCreatingItem}
                        triggerVariant="primary"
                    >
                        <div className="flex flex-col gap-6 mt-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-[500] text-black">Item Name</label>
                                <Input
                                    placeholder="e.g. Formal Shirt"
                                    value={createItemData.name}
                                    onChange={(e) => setCreateItemData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-[500] text-black">Wash Price</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1.99"
                                    min={0}
                                    step="0.01"
                                    value={createItemData.priceWashing ?? ''}
                                    onChange={(e) => setCreateItemData(prev => ({ ...prev, priceWashing: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-[500] text-black">Dry Clean Price</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1.99"
                                    min={0}
                                    step="0.01"
                                    value={createItemData.priceDryCleaning ?? ''}
                                    onChange={(e) => setCreateItemData(prev => ({ ...prev, priceDryCleaning: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[14px] font-[500] text-black">Price Type</label>
                                    <Select
                                        options={[
                                            { label: 'Fixed', value: 'Fixed' },
                                            { label: 'From', value: 'From' },
                                            { label: 'Kg', value: 'Kg' }
                                        ]}
                                        value={createItemData.priceType}
                                        onChange={(e) => setCreateItemData(prev => ({ ...prev, priceType: e.target.value }))}
                                        fullWidth
                                    />
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[14px] font-[500] text-black">Position</label>
                                    <Input
                                        type="number"
                                        placeholder="1"
                                        min={1}
                                        value={createItemData.position ?? ''}
                                        onChange={(e) => setCreateItemData(prev => ({ ...prev, position: e.target.value ? Number(e.target.value) : undefined }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </FormDialog>
                </div>
            </div>

            <GenericTable columns={columns} data={items} />
        </div>
    )
}

export default ItemsTable
