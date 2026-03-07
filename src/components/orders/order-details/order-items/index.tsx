"use client"
import React, { useEffect, useState } from 'react'
import Card from '@/components/common/Card'
import GenericTable from '@/components/common/GenericTable'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import FormDialog from '@/components/common/form-dailog'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'

interface OrderItem {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id: string;
    item: string;
    quantity: number;
    cleaningMethod: string;
    pricePerUnit: number;
    totalPrice: number;
    openItemName: string;
    piece: number;
    isApproved: boolean;
}

interface ItemCategory {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id: string;
    name: string;
    washingLabel: string;
}

interface OrderItemsData {
    totalItems: number;
    member: OrderItem[];
}

const cleaningMethodMap: Record<string, string> = {
    dry_cleaning: "Dry Cleaning",
    washing: "Wash",
    ironing: "Ironing",
    wash_fold: "Wash & Fold",
}

const cleaningMethodOptions = [
    { label: "Select", value: "" },
    { label: "Wash", value: "washing" },
    { label: "Dry Clean", value: "dry_cleaning" },
]

function OrderItems({ orderId, revenue }: { orderId: string; revenue: number }) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [openItemName, setOpenItemName] = useState("")
    const [quantity, setQuantity] = useState("")
    const [pieces, setPieces] = useState("")
    const [cleaningMethod, setCleaningMethod] = useState("")
    const [pricePerUnit, setPricePerUnit] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

    const [itemCategories, setItemCategories] = useState<ItemCategory[]>([])
    const [regularItem, setRegularItem] = useState("")
    const [regularQuantity, setRegularQuantity] = useState("1")
    const [regularCleaningMethod, setRegularCleaningMethod] = useState("")
    const [regularPricePerUnit, setRegularPricePerUnit] = useState("")
    const [createRegularLoading, setCreateRegularLoading] = useState(false)

    const handleCreateOpenItem = async (): Promise<boolean> => {
        setCreateLoading(true)
        const response = await apiCall({
            endpoint: routes.api.createOpenItem,
            method: "POST",
            data: {
                openItemName,
                quantity: quantity ? Number(quantity) : 1,
                piece: pieces ? Number(pieces) : 0,
                cleaningMethod,
                pricePerUnit: pricePerUnit ? Number(pricePerUnit) : 0,
                order: `/orders/${orderId}`,
            },
            showSuccessToast: true,
            successMessage: "Open item created successfully",
        })
        setCreateLoading(false)
        if (response.success) {
            setOpenItemName("")
            setQuantity("")
            setPieces("")
            setCleaningMethod("")
            setPricePerUnit("")
            await getOrderItems()
            return true
        }
        return false
    }

    const getOrderItems = async () => {
        const response = await apiCall<OrderItemsData>({
            endpoint: routes.api.getOrderItems(orderId),
            method: "GET",
            headers: { "Accept": "application/ld+json" },
        })
        if (response.success && response?.data) {
            setOrderItems(response.data.member)
        }
    }

    const getItemCategories = async () => {
        const response = await apiCall<{ member: ItemCategory[] }>({
            endpoint: routes.api.getItemCategories,
            method: "GET",
            headers: { "Accept": "application/ld+json" },
        })
        if (response.success && response?.data) {
            setItemCategories(response.data.member)
        }
    }

    const selectedItemData = itemCategories.find(item => item["@id"] === regularItem)

    const getRegularCleaningOptions = () => {
        if (!selectedItemData) return cleaningMethodOptions
        const label = selectedItemData.washingLabel?.toLowerCase()
        if (label === "washing") {
            return [
                { label: "Select", value: "" },
                { label: "Wash", value: "washing" },
                { label: "Dry Clean", value: "dry_cleaning", disabled: true },
            ]
        }
        if (label === "dry_cleaning") {
            return [
                { label: "Select", value: "" },
                { label: "Wash", value: "washing", disabled: true },
                { label: "Dry Clean", value: "dry_cleaning" },
            ]
        }
        return cleaningMethodOptions
    }

    const handleCreateRegularItem = async (): Promise<boolean> => {
        setCreateRegularLoading(true)
        const response = await apiCall({
            endpoint: routes.api.createRegularItem,
            method: "POST",
            data: {
                item: regularItem,
                quantity: regularQuantity ? Number(regularQuantity) : 1,
                cleaningMethod: regularCleaningMethod,
                pricePerUnit: regularPricePerUnit ? Number(regularPricePerUnit) : 0,
                order: `/orders/${orderId}`,
            },
            showSuccessToast: true,
            successMessage: "Regular item created successfully",
        })
        setCreateRegularLoading(false)
        if (response.success) {
            setRegularItem("")
            setRegularQuantity("1")
            setRegularCleaningMethod("")
            setRegularPricePerUnit("")
            await getOrderItems()
            return true
        }
        return false
    }

    useEffect(() => {
        getOrderItems()
        getItemCategories()
    }, [])

    const columns = [
        {
            accessor: (row: OrderItem) => row.openItemName || "-",
            header: "Item Name",
            sortable: false,
        },
        {
            accessor: "quantity" as keyof OrderItem,
            header: "Quantity",
        },
        {
            accessor: (row: OrderItem) => cleaningMethodMap[row.cleaningMethod] || row.cleaningMethod,
            header: "Cleaning Method",
            sortable: false,
        },
        {
            accessor: (row: OrderItem) => `£${row.pricePerUnit}`,
            header: "Unit Price",
            sortable: false,
        },
        {
            accessor: (row: OrderItem) => `£${row.totalPrice}`,
            header: "Total",
            sortable: false,
        },
        {
            accessor: () => (
                <button
                    className="text-delete hover:text-red-700 font-[400] text-[20px] transition-colors cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    ✕
                </button>
            ),
            header: "Total",
            sortable: false,
            className: "text-right",
            isAction: true,
        },
    ]

    return (
        <div>
            <Card className="mx-0 h-full !p-0">
                <div className="flex items-center justify-between mb-[20px] border-b border-muted py-6 px-6">
                    <h3 className="text-[18px] font-[600] text-black uppercase ">Order Items</h3>
                    <div className="flex items-center gap-[10px]">
                        <FormDialog
                            title="Add Open Item"
                            buttonText="+ Open Item"
                            saveButtonText="Save"
                            onSubmit={handleCreateOpenItem}
                            loading={createLoading}
                        >
                            <div className="flex flex-col gap-[20px]">
                                <div>
                                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Item Name</label>
                                    <Input
                                        placeholder="e.g. Formal Shirt"
                                        value={openItemName}
                                        onChange={(e) => setOpenItemName(e.target.value)}
                                        type="text"
                                    />
                                </div>
                                <div className="flex gap-[20px]">
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Quantity</label>
                                        <Input
                                            placeholder="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Pieces</label>
                                        <Input
                                            placeholder="e.g. 2"
                                            value={pieces}
                                            onChange={(e) => setPieces(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-[20px]">
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Cleaning Method</label>
                                        <Select
                                            options={cleaningMethodOptions}
                                            placeholder="Select"
                                            value={cleaningMethod}
                                            onChange={(e) => setCleaningMethod(e.target.value)}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Price Per Unit</label>
                                        <Input
                                            placeholder="e.g. 5000"
                                            value={pricePerUnit}
                                            onChange={(e) => setPricePerUnit(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormDialog>
                        <FormDialog
                            title="Add Regular Item"
                            buttonText="+ Regular Item"
                            saveButtonText="Save"
                            onSubmit={handleCreateRegularItem}
                            loading={createRegularLoading}
                        >
                            <div className="flex flex-col gap-[20px]">
                                <div className="flex gap-[20px]">
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Item</label>
                                        <Select
                                            options={[
                                                { label: "Select", value: "" },
                                                ...itemCategories.map(item => ({ label: item.name, value: item["@id"] || item.id }))
                                            ]}
                                            placeholder="Select"
                                            value={regularItem}
                                            onChange={(e) => {
                                                setRegularItem(e.target.value)
                                                setRegularCleaningMethod("")
                                            }}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Quantity</label>
                                        <Input
                                            placeholder="1"
                                            value={regularQuantity}
                                            onChange={(e) => setRegularQuantity(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-[20px]">
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Cleaning Method</label>
                                        <Select
                                            options={getRegularCleaningOptions()}
                                            placeholder="Select"
                                            value={regularCleaningMethod}
                                            onChange={(e) => setRegularCleaningMethod(e.target.value)}
                                            fullWidth
                                            disabled={!regularItem}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-black font-[500] text-[14px] mb-[8px] block">Price Per Unit</label>
                                        <Input
                                            placeholder="e.g. 5000"
                                            value={regularPricePerUnit}
                                            onChange={(e) => setRegularPricePerUnit(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormDialog>
                    </div>
                </div>
                {orderItems.length > 0 ? (
                    <GenericTable
                        data={orderItems}
                        columns={columns}
                    />
                ) : (
                    <div className="flex items-center justify-center py-[60px] text-neutral text-[14px]">
                        No items added yet!
                    </div>
                )}
            </Card>
            <div className="flex items-center justify-end gap-10 mx-8 mt-[20px] mb-[30px]">
                <p className="text-[16px] font-[700] text-black">Total Revenue</p>
                <p className="text-[16px] font-[700] text-black">£{orderItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0).toFixed(2)}</p>
            </div>
        </div>
    )
}

export default OrderItems
