"use client";
import React, { useEffect, useState } from "react";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import GenericTable from "@/components/common/GenericTable";

interface FeedbackUser {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  name: string;
}

interface FeedbackItem {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  rating: number;
  description: string;
  user: FeedbackUser;
  appFeatured: boolean;
  createdAt: string;
}

interface FeedbackData {
  totalItems: number;
  member: FeedbackItem[];
  view?: {
    first?: string;
    last?: string;
    next?: string;
    previous?: string;
  };
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface FeedbackFilters {
  featuredOnly: boolean;
}

function buildEndpoint(
  filters: FeedbackFilters,
  page: number,
  sortBy: { field: string; direction: string } | null
): string {
  const parts: string[] = [];
  if (filters.featuredOnly) {
    parts.push("boolean[appFeatured]=true");
  }
  if (sortBy) {
    parts.push(`order[${sortBy.field}]=${sortBy.direction.toUpperCase()}`);
  }
  const base = routes.api.getFeedback(page);
  return parts.length > 0 ? `${base}&${parts.join("&")}` : base;
}

function FeedbackTable({ filters }: { filters: FeedbackFilters }) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: string;
  } | null>({ field: "createdAt", direction: "desc" });
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const getFeedback = async (page: number) => {
    setIsLoading(true);
    const response = await apiCall<FeedbackData>({
      endpoint: buildEndpoint(filters, page, sortBy),
      method: "GET",
    });
    if (response.success && response?.data) {
      setFeedback(response.data.member);
      setTotalItems(response.data.totalItems);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.featuredOnly, sortBy]);

  useEffect(() => {
    getFeedback(currentPage);
  }, [currentPage, filters.featuredOnly, sortBy]);

  const handleColumnSort = (field: string) => {
    setSortBy((prev) => {
      if (prev && prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "desc" };
    });
  };

  const toggleFeatured = async (
    id: string,
    currentStatus: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setLoadingActionId(id);
    const endpoint = currentStatus
      ? routes.api.markFeedbackUnfeatured(id)
      : routes.api.markFeedbackFeatured(id);

    const response = await apiCall({
      endpoint,
      method: "POST",
      data: {},
      showSuccessToast: true,
      successMessage: `Feedback marked as ${currentStatus ? "unfeatured" : "featured"} successfully`,
    });

    if (response.success) {
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, appFeatured: !currentStatus } : item
        )
      );
    }
    setLoadingActionId(null);
  };

  const getRatingStyle = (rating: number) => {
    switch (rating) {
      case 5:
        return "bg-[#E8FAD4] text-[#3B6B10]";
      case 4:
        return "bg-[#EDF5E1] text-[#3B6B10]";
      case 3:
        return "bg-[#FFF7E0] text-[#A2750C]";
      case 2:
        return "bg-[#FFF0E0] text-[#B05A0C]";
      case 1:
        return "bg-[#FFEBEE] text-[#B91C1C]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      accessor: (row: FeedbackItem) => (
        <span
          className={`inline-flex items-center justify-center w-[36px] h-[36px] rounded-[8px] font-[600] text-[15px] ${getRatingStyle(
            row.rating
          )}`}
        >
          {row.rating}
        </span>
      ),
      header: "Rating",
      sortable: true,
      sortKey: "rating" as keyof FeedbackItem,
      className: "w-[80px]",
    },
    {
      accessor: (row: FeedbackItem) => (
        <span className="font-[500]">{row.user?.name || "N/A"}</span>
      ),
      header: "Name",
      sortable: false,
    },
    {
      accessor: (row: FeedbackItem) => (
        <span className="text-neutral">{row.description || "N/A"}</span>
      ),
      header: "Description",
      sortable: false,
      className: "max-w-[400px]",
    },
    {
      accessor: (row: FeedbackItem) => (
        <span className="text-info-text">{formatDate(row.createdAt)}</span>
      ),
      header: "Date",
      sortable: true,
      sortKey: "createdAt" as keyof FeedbackItem,
    },
    {
      accessor: (row: FeedbackItem) => (
        <span
          onClick={(e) => toggleFeatured(row.id, row.appFeatured, e)}
          className={`inline-block min-w-[100px] py-[6px] rounded-full text-[15px] font-[500] text-center cursor-pointer transition-opacity ${
            loadingActionId === row.id
              ? "opacity-50 pointer-events-none"
              : "hover:opacity-80"
          } ${
            row.appFeatured
              ? "bg-secondary text-black"
              : "bg-[#F3F4F6] text-[#6B7280]"
          }`}
        >
          {row.appFeatured ? "Yes" : "No"}
        </span>
      ),
      header: "Featured",
      sortable: false,
      className: "text-center",
    },
  ];

  return (
    <div className="mt-[30px] px-4 md:px-[50px] mb-10">
      <GenericTable
        data={feedback}
        columns={columns}
        isLoading={isLoading}
        backendPagination={{
          currentPage,
          totalItems,
          pageSize: PAGE_SIZE,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}

export default FeedbackTable;
