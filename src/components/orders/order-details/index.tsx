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
    "in progress": "bg-[#E0E7FF] text-[#3730A3]",
    "in-progress": "bg-[#E0E7FF] text-[#3730A3]",
    cancelled: "bg-[#FEE2E2] text-[#991B1B]",
}

function OrderDetails() {
    const params = useParams()
    const orderId = params["order-details"] as string
    const [order, setOrder] = useState<OrderDetail | null>(null)

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

    useEffect(() => {
        getOrderDetails()
    }, [])

    if (!order) return null

    const statusLabel = order.status.replace(/-/g, " ")
    const statusStyle = statusStyles[order.status.toLowerCase()] || "bg-gray-100 text-gray-600"

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
                        <button className="px-6 py-[10px] rounded-[8px] font-[500] text-[20px] cursor-pointer transition-colors duration-200 border border-delete text-delete hover:bg-[#FEE2E2] flex items-center gap-[6px]">
                            ✕ Cancel Order
                        </button>
                        <button className="px-6 py-[10px] rounded-[8px] font-[500] text-[20px] cursor-pointer transition-colors duration-200 bg-black text-white hover:bg-neutral-700 flex items-center gap-[6px]">
                            ✓ Finalize Order
                        </button>
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
                    <OrderItems orderId={orderId} revenue={order.revenue} />
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
