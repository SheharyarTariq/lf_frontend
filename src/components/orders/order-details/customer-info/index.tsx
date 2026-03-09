"use client"
import React from 'react'
import Card from '@/components/common/Card'

interface OrderUser {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
}

function CustomerInfo({ user }: { user: OrderUser | null }) {
    if (!user) return null

    return (
        <Card className="!p-0 w-full">
            <h3 className="text-[13px] font-[600] text-black uppercase p-6 mb-[16px] border-b border-muted">Customer</h3>

            <div className="flex flex-col gap-[8px] px-6 py-4">
                <p className="text-[16px] font-[600] text-black">{user.name}</p>
                <p className="text-[12px] text-neutral">{user.email}</p>
                {user.phone && (
                    <div className="flex items-center gap-[8px] text-[13px] text-neutral">
                        <span>📱</span>
                        <span>{user.phone}</span>
                    </div>
                )}
                {user.address && (
                    <div className="flex items-center gap-[8px] text-[13px] text-neutral">
                        <span>📍</span>
                        <span>{user.address}</span>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default CustomerInfo
