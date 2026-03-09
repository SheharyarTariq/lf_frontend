"use client"
import React, { useEffect, useState } from 'react'
import Card from '@/components/common/Card'
import GenericTable from '@/components/common/GenericTable'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import FormDialog from '@/components/common/form-dailog'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import { validateAndSetErrors } from '@/utils/validation'
import { openItemSchema, regularItemSchema } from '../../schema'

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

interface RegularItemOption {
  id: string;
  atId: string;
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

function OrderItems({ orderId, revenue, onItemsChange }: { orderId: string; revenue: number; onItemsChange?: () => void }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [openItemData, setOpenItemData] = useState({
    openItemName: "",
    quantity: "",
    piece: "",
    cleaningMethod: "",
    pricePerUnit: "",
  })
  const [openItemErrors, setOpenItemErrors] = useState<Record<string, string>>({})
  const [createLoading, setCreateLoading] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([])
  const [allItems, setAllItems] = useState<RegularItemOption[]>([])
  const [regularItemData, setRegularItemData] = useState({
    item: "",
    quantity: "1",
    cleaningMethod: "",
    pricePerUnit: "",
  })
  const [regularItemErrors, setRegularItemErrors] = useState<Record<string, string>>({})
  const [createRegularLoading, setCreateRegularLoading] = useState(false)

  const handleCreateOpenItem = async (): Promise<boolean> => {
    if (!await validateAndSetErrors(openItemSchema, { openItemName: openItemData.openItemName, quantity: openItemData.quantity ? Number(openItemData.quantity) : undefined, piece: openItemData.piece ? Number(openItemData.piece) : undefined, cleaningMethod: openItemData.cleaningMethod, pricePerUnit: openItemData.pricePerUnit ? Number(openItemData.pricePerUnit) : undefined }, setOpenItemErrors)) return false;
    setCreateLoading(true)
    const response = await apiCall({
      endpoint: routes.api.createOpenItem,
      method: "POST",
      data: {
        openItemName: openItemData.openItemName,
        quantity: openItemData.quantity ? Number(openItemData.quantity) : 1,
        piece: openItemData.piece ? Number(openItemData.piece) : 0,
        cleaningMethod: openItemData.cleaningMethod,
        pricePerUnit: openItemData.pricePerUnit ? Number(openItemData.pricePerUnit) : 0,
        order: `/orders/${orderId}`,
      },
      showSuccessToast: true,
      successMessage: "Open item created successfully",
    })
    setCreateLoading(false)
    if (response.success) {
      setOpenItemErrors({})
      setOpenItemData({
        openItemName: "",
        quantity: "",
        piece: "",
        cleaningMethod: "",
        pricePerUnit: "",
      })
      await getOrderItems()
      onItemsChange?.()
      return true
    }
    return false
  }

  const getOrderItems = async () => {
    setLoading(true)
    const response = await apiCall<OrderItemsData>({
      endpoint: routes.api.getOrderItems(orderId),
      method: "GET",
    })
    if (response.success && response?.data) {
      setOrderItems(response.data.member)
    }
    setLoading(false)
  }

  const getItemCategories = async () => {
    const response = await apiCall<{ member: ItemCategory[] }>({
      endpoint: routes.api.getItemCategories,
      method: "GET",
      headers: { "Accept": "application/ld+json" },
    })
    if (response.success && response?.data) {
      setItemCategories(response.data.member)
      await fetchAllItems(response.data.member)
    }
  }

  const fetchAllItems = async (categories: ItemCategory[]) => {
    const itemsList: RegularItemOption[] = []
    for (const category of categories) {
      const response = await apiCall<{ member: { "@id"?: string; id: string; name: string }[] }>({
        endpoint: routes.api.getItemCategoryDetails(category.id),
        method: "GET",
        headers: { "Accept": "application/ld+json" },
      })
      if (response.success && response.data) {
        response.data.member.forEach(item => {
          itemsList.push({
            id: item.id,
            atId: item["@id"] || `/items/${item.id}`,
            name: item.name,
            washingLabel: category.washingLabel,
          })
        })
      }
    }
    setAllItems(itemsList)
  }

  const selectedItemData = allItems.find(item => item.atId === regularItemData.item)

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
    if (!await validateAndSetErrors(regularItemSchema, { item: regularItemData.item, quantity: regularItemData.quantity ? Number(regularItemData.quantity) : undefined, pricePerUnit: regularItemData.pricePerUnit ? Number(regularItemData.pricePerUnit) : undefined }, setRegularItemErrors)) return false;
    const payload = {
      item: regularItemData.item,
      quantity: regularItemData.quantity ? Number(regularItemData.quantity) : 1,
      cleaningMethod: regularItemData.cleaningMethod,
      pricePerUnit: regularItemData.pricePerUnit ? Number(regularItemData.pricePerUnit) : 0,
      order: `/orders/${orderId}`,
    }
    console.log("Regular Item Payload:", JSON.stringify(payload))
    const response = await apiCall({
      endpoint: routes.api.createRegularItem,
      method: "POST",
      data: payload,
      showSuccessToast: true,
      successMessage: "Regular item created successfully",
    })
    setCreateRegularLoading(false)
    if (response.success) {
      setRegularItemErrors({})
      setRegularItemData({
        item: "",
        quantity: "1",
        cleaningMethod: "",
        pricePerUnit: "",
      })
      await getOrderItems()
      onItemsChange?.()
      return true
    }
    return false
  }

  const handleDeleteOrderItem = async (): Promise<boolean> => {
    setIsDeletingItem(true)
    const response = await apiCall({
      endpoint: routes.api.deleteOrderItem(deleteItemId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Item deleted successfully",
    })
    setIsDeletingItem(false)
    if (response.success) {
      await getOrderItems()
      onItemsChange?.()
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
      accessor: (row: OrderItem) => {
        if (row.openItemName) return row.openItemName
        const matched = allItems.find(i => i.atId === row.item || `/items/${i.id}` === row.item)
        return matched?.name || "-"
      },
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
      accessor: (row: OrderItem) => (
        <div className='flex items-center justify-end'>
          <FormDialog
            title="Delete Item"
            buttonText={
              <div onClick={() => setDeleteItemId(row.id)}>
                <img src="/assets/trashEnabled.svg" alt="Delete" className="cursor-pointer h-[38px] w-[38px]" />
              </div>
            }
            saveButtonText="Yes"
            onSubmit={handleDeleteOrderItem}
            loading={isDeletingItem}
            triggerVariant="icon"
            submitVariant="delete"
          >
            Are you sure you want to delete this item?
            <span className="mt-[8px] block">This action cannot be undone.</span>
          </FormDialog>
        </div>
      ),
      header: "Action",
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
                    value={openItemData.openItemName}
                    onChange={(e) => {
                      setOpenItemData(prev => ({ ...prev, openItemName: e.target.value }));
                      if (openItemErrors.openItemName) setOpenItemErrors(prev => ({ ...prev, openItemName: '' }));
                    }}
                    type="text"
                    error={openItemErrors.openItemName}
                  />
                </div>
                <div className="flex gap-[20px]">
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Quantity</label>
                    <Input
                      placeholder="1"
                      value={openItemData.quantity}
                      onChange={(e) => {
                        setOpenItemData(prev => ({ ...prev, quantity: e.target.value }));
                        if (openItemErrors.quantity) setOpenItemErrors(prev => ({ ...prev, quantity: '' }));
                      }}
                      type="number"
                      error={openItemErrors.quantity}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Pieces</label>
                    <Input
                      placeholder="e.g. 2"
                      value={openItemData.piece}
                      onChange={(e) => {
                        setOpenItemData(prev => ({ ...prev, piece: e.target.value }));
                        if (openItemErrors.piece) setOpenItemErrors(prev => ({ ...prev, piece: '' }));
                      }}
                      type="number"
                      error={openItemErrors.piece}
                    />
                  </div>
                </div>
                <div className="flex gap-[20px]">
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Cleaning Method</label>
                    <Select
                      options={cleaningMethodOptions}
                      placeholder="Select"
                      value={openItemData.cleaningMethod}
                      onChange={(e) => {
                        setOpenItemData(prev => ({ ...prev, cleaningMethod: e.target.value }));
                        if (openItemErrors.cleaningMethod) setOpenItemErrors(prev => ({ ...prev, cleaningMethod: '' }));
                      }}
                      fullWidth
                      error={openItemErrors.cleaningMethod}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Price Per Unit</label>
                    <Input
                      placeholder="e.g. 5000"
                      value={openItemData.pricePerUnit}
                      onChange={(e) => {
                        setOpenItemData(prev => ({ ...prev, pricePerUnit: e.target.value }));
                        if (openItemErrors.pricePerUnit) setOpenItemErrors(prev => ({ ...prev, pricePerUnit: '' }));
                      }}
                      type="number"
                      error={openItemErrors.pricePerUnit}
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
                        ...allItems.map(item => ({ label: item.name, value: item.atId }))
                      ]}
                      placeholder="Select"
                      value={regularItemData.item}
                      onChange={(e) => {
                        setRegularItemData(prev => ({ ...prev, item: e.target.value, cleaningMethod: "" }));
                        if (regularItemErrors.item) setRegularItemErrors(prev => ({ ...prev, item: '' }));
                      }}
                      fullWidth
                      searchable
                      error={regularItemErrors.item}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Quantity</label>
                    <Input
                      placeholder="1"
                      value={regularItemData.quantity}
                      onChange={(e) => {
                        setRegularItemData(prev => ({ ...prev, quantity: e.target.value }));
                        if (regularItemErrors.quantity) setRegularItemErrors(prev => ({ ...prev, quantity: '' }));
                      }}
                      type="number"
                      error={regularItemErrors.quantity}
                    />
                  </div>
                </div>
                <div className="flex gap-[20px]">
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Cleaning Method</label>
                    <Select
                      options={getRegularCleaningOptions()}
                      placeholder="Select"
                      value={regularItemData.cleaningMethod}
                      onChange={(e) => {
                        console.log("Cleaning method selected:", e.target.value)
                        setRegularItemData(prev => ({ ...prev, cleaningMethod: e.target.value }))
                      }}
                      fullWidth
                      disabled={!regularItemData.item}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-black font-[500] text-[14px] mb-[8px] block">Price Per Unit</label>
                    <Input
                      placeholder="e.g. 5000"
                      value={regularItemData.pricePerUnit}
                      onChange={(e) => {
                        setRegularItemData(prev => ({ ...prev, pricePerUnit: e.target.value }));
                        if (regularItemErrors.pricePerUnit) setRegularItemErrors(prev => ({ ...prev, pricePerUnit: '' }));
                      }}
                      type="number"
                      error={regularItemErrors.pricePerUnit}
                    />
                  </div>
                </div>
              </div>
            </FormDialog>
          </div>
        </div>
        {orderItems.length > 0 || loading ? (
          <GenericTable
            data={orderItems}
            columns={columns}
            isLoading={loading}
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
