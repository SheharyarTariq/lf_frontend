"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import GenericTable from "@/components/common/GenericTable";
import Image from "next/image";

interface UserArea {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  name: string;
}

interface UserPostcode {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  postcodeString: string;
  isActive: boolean;
  area: UserArea;
}

interface User {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  email: string;
  phone: string;
  status: string;
  name: string;
  registeredAt: string;
  emailVerifiedAt: string;
  postcode: UserPostcode;
}

interface UsersData {
  totalItems: number;
  member: User[];
  view?: {
    first?: string;
    last?: string;
    next?: string;
    previous?: string;
  };
}

const statusStyles: Record<string, string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  deleted: "bg-[#FEE2E2] text-[#991B1B]",
  deletion_requested: "bg-[#FEF3C7] text-[#92400E]",
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

interface UsersFilters {
  search: string;
  status: string;
  sortBy: string;
}

function buildEndpoint(filters: UsersFilters, page: number): string {
  const parts: string[] = [];
  if (filters.search)
    parts.push(`search=${encodeURIComponent(filters.search)}`);
  if (filters.status)
    parts.push(`exact[status][]=${encodeURIComponent(filters.status)}`);
  if (filters.sortBy) {
    const [field, order] = filters.sortBy.split(":");
    if (field && order) {
      parts.push(`order[${field}]=${order.toUpperCase()}`);
    }
  }
  const base = routes.api.getUsers(page);
  return parts.length > 0 ? `${base}&${parts.join("&")}` : base;
}

function UsersTable({ filters }: { filters: UsersFilters }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 30;
  const router = useRouter();

  const getUsers = async (page: number) => {
    setIsLoading(true);
    const response = await apiCall<UsersData>({
      endpoint: buildEndpoint(filters, page),
      method: "GET",
    });
    if (response.success && response?.data) {
      setUsers(response.data.member);
      setTotalItems(response.data.totalItems);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.sortBy]);

  useEffect(() => {
    getUsers(currentPage);
  }, [currentPage, filters.search, filters.status, filters.sortBy]);

  const columns = [
    {
      accessor: (row: User) => (
        <div>
          <div className="font-[500]">{row.name || "N/A"}</div>
          <div className="text-[13px] text-neutral">{row.email || "N/A"}</div>
        </div>
      ),
      header: "Customer",
      sortable: false,
      className: "text-left",
    },
    {
      accessor: "phone" as keyof User,
      header: "Phone",
      sortable: false,
    },
    {
      accessor: (row: User) => (
        <div>
          <div className="font-[500]">{row.postcode?.area?.name || "N/A"}</div>
          <div className="text-[13px] text-neutral">
            {row.postcode?.postcodeString || "N/A"}
          </div>
        </div>
      ),
      header: "Address",
      sortable: false,
      className: "text-left",
    },
    {
      accessor: (row: User) => {
        const label = row.status.replace(/_/g, " ");
        const style =
          statusStyles[row.status.toLowerCase()] || "bg-gray-100 text-gray-600";
        return (
          <span
            className={`inline-block w-[140px] py-[4px] rounded-full text-[13px] font-[500] capitalize text-center ${style}`}
          >
            {label}
          </span>
        );
      },
      header: "Status",
      sortable: false,
      className: "w-[140px] text-center",
    },
    {
      accessor: (row: User) => (
        <span className="text-info-text">{formatDate(row.registeredAt)}</span>
      ),
      header: "Registered At",
      sortable: true,
      sortKey: "registeredAt" as keyof User,
    },
    {
      accessor: (row: User) => (row.emailVerifiedAt ? "Yes" : "No"),
      header: "Email Verified",
      sortable: false,
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
      header: "Details",
      className: "text-right",
      sortable: false,
      isAction: true,
    },
  ];

  return (
    <div className="mt-[30px] px-[50px] mb-10">
      <GenericTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        backendPagination={{
          currentPage,
          totalItems,
          pageSize: PAGE_SIZE,
          onPageChange: setCurrentPage,
        }}
        onRowClick={(row) => router.push(routes.ui.userDetails(row.id))}
      />
    </div>
  );
}

export default UsersTable;
