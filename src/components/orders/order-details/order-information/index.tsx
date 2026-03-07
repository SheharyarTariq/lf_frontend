"use client"
import React from 'react'
import Card from '@/components/common/Card'

interface OrderSlot {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    id?: string;
    startTime: string;
    endTime: string;
}

interface OrderInformationProps {
    createdAt: string;
    pickupDate: string;
    pickupSlot: OrderSlot | null;
    dropoffDate: string;
    dropoffSlot: OrderSlot | null;
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    return `${datePart} · ${timePart}`
}

function OrderInformation({ createdAt, pickupDate, pickupSlot, dropoffDate, dropoffSlot }: OrderInformationProps) {
    const pickupDisplay = pickupDate ? formatDate(pickupDate) : ""
    const pickupTime = pickupSlot
        ? `${pickupSlot.startTime || ""}-${pickupSlot.endTime || ""}`
        : ""

    const dropoffDisplay = dropoffDate ? formatDate(dropoffDate) : ""
    const dropoffTime = dropoffSlot
        ? `${dropoffSlot.startTime || ""}-${dropoffSlot.endTime || ""}`
        : ""

    return (
        <Card className="mx-0 w-full">
            <h3 className="text-[13px] font-[600] text-black uppercase tracking-[1px] mb-[16px]">Order Information</h3>
            <div className="flex flex-col gap-[12px]">
                <div className="border-l-[3px] border-[#D1D5DB] rounded-r-[6px] px-[14px] py-[8px]">
                    <p className="text-[11px] font-[600] text-neutral uppercase tracking-[0.5px]">Created At</p>
                    <p className="text-[14px] font-[500] text-black">{formatDateTime(createdAt)}</p>
                </div>
                <div className="border-l-[3px] border-[#D1D5DB] rounded-r-[6px] px-[14px] py-[8px]">
                    <p className="text-[11px] font-[600] text-neutral uppercase tracking-[0.5px]">Pickup</p>
                    <p className="text-[14px] font-[500] text-black">
                        {pickupDisplay}{pickupTime ? ` · ${pickupTime}` : ""}
                    </p>
                </div>
                <div className="border-l-[3px] border-[#D1D5DB] rounded-r-[6px] px-[14px] py-[8px]">
                    <p className="text-[11px] font-[600] text-neutral uppercase tracking-[0.5px]">Drop Off</p>
                    <p className="text-[14px] font-[500] text-black">
                        {dropoffDisplay}{dropoffTime ? ` · ${dropoffTime}` : ""}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default OrderInformation
