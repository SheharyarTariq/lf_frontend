"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import apiCall from '@/utils/api-call'
import { routes } from '@/utils/routes'
import BackArrow from '@/components/common/BackArrow'
import CustomerInfo from './customer-info'
import SpecialNotes from './special-notes'
import OrderInformation from './order-information'
import OrderItems from './order-items'
import FormDialog from '@/components/common/form-dailog'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'

interface OrderSlot {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id?: string;
    startTime: string;
    endTime: string;
}

interface OrderUser {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
}

interface OrderItemData {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    item: {
        "@context"?: string;
        "@id"?: string;
        "@type"?: string;
        name: string;
        priceType: string;
    };
    quantity: number;
    cleaningMethod: string;
    pricePerUnit: number;
    totalPrice: number;
    openItemName: string;
    piece: number;
    isApproved: boolean;
}

interface OrderDetail {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id: string;
    number: number;
    status: string;
    type: string;
    pickupDate: string;
    pickupSlot: OrderSlot;
    dropoffDate: string;
    dropoffSlot: OrderSlot;
    note: string;
    revenue: number;
    createdAt: string;
    user: OrderUser;
    orderItems: OrderItemData[];
}

const statusStyles: Record<string, string> = {
    created: "bg-[#E3ECF6] text-[#3A4F6C]",
    delivered: "bg-[#D1FAE5] text-[#065F46]",
    cancelled: "bg-[#FEE2E2] text-[#991B1B]",
    processing: "bg-[#DBEAFE] text-[#1E40AF]",
    awaiting_review: "bg-[#FEF3C7] text-[#92400E]",
    payment_failed: "bg-[#FDE8E8] text-[#9B1C1C]",
    payment_pending: "bg-[#F3E8FF] text-[#6B21A8]",
}

function OrderDetails() {
    const params = useParams()
    const orderId = params["order-details"] as string
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)
    const [finaliseLoading, setFinaliseLoading] = useState(false)

    const getOrderDetails = async () => {
        const response = await apiCall<OrderDetail>({
            endpoint: routes.api.getOrderDetails(orderId),
            method: "GET",
            headers: { "Accept": "application/ld+json" },
        })
        if (response.success && response?.data) {
            setOrder(response.data)
        }
    }

    const handleCancelOrder = async (): Promise<boolean> => {
        setCancelLoading(true)
        const response = await apiCall({
            endpoint: routes.api.cancelOrder(orderId),
            method: "POST",
            headers: { "Content-Type": "application/ld+json" },
            showSuccessToast: true,
            successMessage: "Order cancelled successfully",
            data: {}
        })
        setCancelLoading(false)
        if (response.success) {
            await getOrderDetails()
            return true
        }
        return false
    }

    const handleFinaliseOrder = async (): Promise<boolean> => {
        setFinaliseLoading(true)
        const response = await apiCall({
            endpoint: routes.api.finaliseOrder(orderId),
            method: "POST",
            headers: { "Content-Type": "application/ld+json" },
            showSuccessToast: true,
            successMessage: "Order finalised successfully",
            data: {}
        })
        setFinaliseLoading(false)
        if (response.success) {
            await getOrderDetails()
            return true
        }
        return false
    }

    useEffect(() => {
        getOrderDetails()
    }, [])

    if (!order) return null

    const statusLabel = order.status.replace(/-/g, " ")
    const statusStyle = statusStyles[order.status.toLowerCase()] || "bg-gray-100 text-gray-600"
    const isCancelled = order.status.toLowerCase() === "cancelled"
    const hasOrderItems = order.orderItems && order.orderItems.length > 0

    return (
        <div className="px-[30px] pt-3 pb-10">
            <div className='flex justify-between border-b border-muted mb-7'>
                <div className='flex items-center gap-[16px] '>
                    <BackArrow />
                    <div className="flex items-center gap-[50px]">
                        <h1 className="text-black text-[32px] font-[500]">Order #{String(order.number).padStart(2, "0")}</h1>
                        <span className={`px-[14px] py-[5px] rounded-full text-[14px] font-[500] capitalize ${statusStyle}`}>
                            {statusLabel}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-[20px] mx-[30px] mb-[30px]">

                    <div className="flex items-center gap-[12px]">
                        {!isCancelled ? (
                            <FormDialog
                                title="Cancel Order"
                                buttonText="✕ Cancel Order"
                                saveButtonText="Yes"
                                onSubmit={handleCancelOrder}
                                loading={cancelLoading}
                                triggerVariant="delete"
                                submitVariant="delete"
                            >
                                Are you sure you want to cancel this order?
                            </FormDialog>
                        ) : (
                            <button className='bg-muted text-placeholder cursor-not-allowed rounded-md py-4 px-6 text-[20px] font-[500]'
                                onClick={() => toast.error("This order is already cancelled", { id: "cancel-error" })}
                            >
                                ✕ Cancel Order
                            </button>
                        )}
                        {hasOrderItems ? (
                            <FormDialog
                                title="Finalize Order"
                                buttonText="✓ Finalize Order"
                                saveButtonText="Confirm"
                                onSubmit={handleFinaliseOrder}
                                loading={finaliseLoading}
                            >
                                Are you sure you want to finalize this order?
                            </FormDialog>
                        ) : (
                            <button className='bg-muted text-placeholder cursor-not-allowed cursor-delete  rounded-md py-4 px-6 text-[20px] font-[500]'
                                onClick={() => toast.error("Add an Item First TO Finalise The Order", { id: "finalise-error" })}
                            >
                                ✓ Finalize Order
                            </button>
                        )
                        }
                    </div>
                </div>
            </div>
            <div className="flex gap-[24px] mx-[30px]">
                <div className="w-[280px] flex-shrink-0 flex flex-col gap-[20px]">
                    <CustomerInfo user={order.user} />
                    <SpecialNotes note={order.note} />
                    <OrderInformation
                        createdAt={order.createdAt}
                        pickupDate={order.pickupDate}
                        pickupSlot={order.pickupSlot}
                        dropoffDate={order.dropoffDate}
                        dropoffSlot={order.dropoffSlot}
                    />
                </div>
                <div className="flex-1">
                    <OrderItems orderId={orderId} revenue={order.revenue} onItemsChange={getOrderDetails} />
                </div>
            </div>
        </div>
    )
}

export default OrderDetails

