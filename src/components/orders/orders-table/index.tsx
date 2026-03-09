"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import GenericTable from "@/components/common/GenericTable";
import Image from "next/image";

interface OrderSlot {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  startTime: string;
  endTime: string;
}

interface OrderUser {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  email: string;
  name: string;
}

interface Order {
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
}

interface OrdersData {
  totalItems: number;
  member: Order[];
}

const statusStyles: Record<string, string> = {
  created: "bg-[#E3ECF6] text-[#3A4F6C]",
  delivered: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
  processing: "bg-[#DBEAFE] text-[#1E40AF]",
  awaiting_review: "bg-[#FEF3C7] text-[#92400E]",
  payment_failed: "bg-[#FDE8E8] text-[#9B1C1C]",
  payment_pending: "bg-[#F3E8FF] text-[#6B21A8]",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getOrders = async () => {
    setIsLoading(true);
    const response = await apiCall<OrdersData>({
      endpoint: routes.api.getOrders,
      method: "GET",
    });
    if (response.success && response?.data) {
      setOrders(response.data.member);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getOrders();
  }, []);

  const columns = [
    {
      accessor: "number" as keyof Order,
      header: "#",
    },
    {
      accessor: (row: Order) => {
        const label = row.status.replace(/-/g, " ");
        const style =
          statusStyles[row.status.toLowerCase()] || "bg-gray-100 text-gray-600";
        return (
          <span
            className={`px-[12px] py-[4px] rounded-full text-[13px] font-[500] capitalize ${style}`}
          >
            {label}
          </span>
        );
      },
      header: "Status",
      sortable: false,
      className: "text-center",
    },
    {
      accessor: "type" as keyof Order,
      header: "Type",
    },
    {
      accessor: (row: Order) => `£${row.revenue}`,
      header: "Revenue",
      sortable: true,
      sortKey: "revenue" as keyof Order,
    },
    {
      accessor: (row: Order) => (
        <div>
          <div className="font-[500]">{formatDate(row.pickupDate)}</div>
          <div className="text-[13px] text-neutral">
            {row.pickupSlot?.startTime || ""} – {row.pickupSlot?.endTime || ""}
          </div>
        </div>
      ),
      header: "Pickup",
      sortable: true,
      sortKey: "pickupDate" as keyof Order,
    },
    {
      accessor: (row: Order) => (
        <div>
          <div className="font-[500]">{formatDate(row.dropoffDate)}</div>
          <div className="text-[13px] text-neutral">
            {row.dropoffSlot?.startTime || ""} –{" "}
            {row.dropoffSlot?.endTime || ""}
          </div>
        </div>
      ),
      header: "Dropoff",
      sortable: true,
      sortKey: "dropoffDate" as keyof Order,
    },
    {
      accessor: (row: Order) => (
        <div>
          <div className="font-[500]">{row.user?.name}</div>
          <div className="text-[13px] text-neutral">{row.user?.email}</div>
        </div>
      ),
      header: "Customer",
      sortable: false,
      className: "text-left",
    },
    {
      accessor: () => (
        <div className="flex items-center justify-end">
          <Image
            src="/assets/ArrowRight.svg"
            alt="Details"
            width={24}
            height={24}
            className="cursor-pointer"
          />
        </div>
      ),
      header: "Action",
      className: "text-right",
      sortable: false,
      isAction: true,
    },
  ];

  return (
    <div className="mt-[30px] px-[50px] mb-10">
      <GenericTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => router.push(routes.ui.orderDetails(row.id))}
      />
    </div>
  );
}

export default OrdersTable;
