"use client";
import React from "react";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";

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
  dropoffDate?: string;
  dropoffSlot?: OrderSlot | null;
  isLoading?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
};

function OrderInformation({
  createdAt,
  pickupDate,
  pickupSlot,
  dropoffDate,
  dropoffSlot,
  isLoading,
}: OrderInformationProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-[20px] w-full">
        <Card className="flex-1 w-full mx-0 h-[80px] flex items-center justify-center p-4">
          <Loader size={24} className="text-gray-400" />
        </Card>
        <Card className="flex-1 w-full mx-0 h-[80px] flex items-center justify-center p-4">
          <Loader size={24} className="text-gray-400" />
        </Card>
        <Card className="flex-1 w-full mx-0 h-[80px] flex items-center justify-center p-4">
          <Loader size={24} className="text-gray-400" />
        </Card>
      </div>
    );
  }

  const pickupDisplay = pickupDate ? formatDate(pickupDate) : "";
  const pickupTime = pickupSlot
    ? `${pickupSlot.startTime || ""}-${pickupSlot.endTime || ""}`
    : "";

  const dropoffDisplay = dropoffDate ? formatDate(dropoffDate) : "";
  const dropoffTime = dropoffSlot
    ? `${dropoffSlot.startTime || ""}-${dropoffSlot.endTime || ""}`
    : "";

  return (
    <div className="flex flex-col xl:flex-row gap-[20px] w-full">
      <Card className="flex-1 w-full mx-0 p-[20px]">
        <p className="text-[11px] md:text-[12px] font-[600] text-neutral uppercase tracking-[0.5px] mb-[8px]">
          Created At
        </p>
        <p className="text-[14px] md:text-[15px] font-[500] text-black">
          {formatDateTime(createdAt)}
        </p>
      </Card>
      <Card className="flex-1 w-full mx-0 p-[20px]">
        <p className="text-[11px] md:text-[12px] font-[600] text-neutral uppercase tracking-[0.5px] mb-[8px]">
          Pickup
        </p>
        <p className="text-[14px] md:text-[15px] font-[500] text-black">
          {pickupDisplay}
          {pickupTime ? ` · ${pickupTime}` : ""}
        </p>
      </Card>
      <Card className="flex-1 w-full mx-0 p-[20px]">
        <p className="text-[11px] md:text-[12px] font-[600] text-neutral uppercase tracking-[0.5px] mb-[8px]">
          Drop Off
        </p>
        <p className="text-[14px] md:text-[15px] font-[500] text-black">
          {dropoffDisplay}
          {dropoffTime ? ` · ${dropoffTime}` : ""}
        </p>
      </Card>
    </div>
  );
}

export default OrderInformation;
