"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import { penceToPounds } from "@/utils/helper";
import GenericTable from "@/components/common/GenericTable";
import Card from "@/components/common/Card";

export interface Order {
  id: string;
  number: number;
  status: string;
  revenue: number;
  createdAt: string;
  orderItems?: { length: number }[];
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
  in_process: "bg-[#E0E7FF] text-[#4338CA]",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

function RecentOrders({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 12;
  const router = useRouter();

  const getOrders = async (page: number) => {
    setIsLoading(true);
    const response = await apiCall<OrdersData>({
      endpoint: `${routes.api.getOrders}?exact[user.id][]=${userId}&page=${page}&itemsPerPage=${PAGE_SIZE}`,
      method: "GET",
    });
    if (response.success && response?.data) {
      setOrders(response.data.member);
      setTotalItems(response.data.totalItems);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getOrders(currentPage);
  }, [currentPage, userId]);

  const columns = [
    {
      accessor: (row: Order) => (
        <span className="font-[600] text-black text-[14px]">
          # {row.number}
        </span>
      ),
      header: "Order",
      sortable: false,
    },
    {
      accessor: (row: Order) => (
        <span className="text-info-text text-[14px]">
          {formatDate(row.createdAt)}
        </span>
      ),
      header: "Order Date",
      sortable: false,
    },
    {
      accessor: (row: Order) => (
        <span className="font-[500] text-black">
          {row.orderItems?.length || 0}
        </span>
      ),
      header: "Items",
      sortable: false,
    },
    {
      accessor: (row: Order) => (
        <span className="font-[600] text-black">
          £{penceToPounds(row.revenue).toFixed(2)}
        </span>
      ),
      header: "Total",
      sortable: false,
    },
    {
      accessor: (row: Order) => {
        let displayStatus = row.status.toLowerCase();
        if (displayStatus === "processing") {
          displayStatus = "in_process";
        }
        const label = displayStatus.replace(/_/g, " ");
        const style =
          statusStyles[displayStatus] || "bg-gray-100 text-gray-600";
        return (
          <span
            className={`inline-block px-[14px] py-[6px] rounded-full text-[13px] font-[500] capitalize text-center ${style}`}
          >
            {label}
          </span>
        );
      },
      header: "Status",
      sortable: false,
      className: "text-right",
    },
  ];

  return (
    <Card className="p-0 border border-muted shadow-none">
      <h3 className="text-[18px] font-[700] text-black uppercase px-6 py-[24px] border-b border-muted">
        RECENT ORDERS
      </h3>
      <div className="px-6 py-[24px]">
        <GenericTable
          data={orders}
          columns={columns}
          isLoading={isLoading}
          backendPagination={{
            currentPage,
            totalItems,
            pageSize: PAGE_SIZE,
            onPageChange: setCurrentPage,
          }}
          onRowClick={(row) =>
            router.push(routes.ui.orderDetails(row.id, row.number))
          }
        />
      </div>
    </Card>
  );
}

export default RecentOrders;
