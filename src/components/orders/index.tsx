"use client";
import React, { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import OrdersTable from "./orders-table";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Created", value: "created" },
  { label: "Processing", value: "processing" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Delivered", value: "delivered" },
  { label: "Awaiting Review", value: "awaiting_review" },
  { label: "Payment Failed", value: "payment_failed" },
  { label: "Payment Pending", value: "payment_pending" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Manual", value: "manual" },
];

function Orders() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px]">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black">Orders</h1>
        <div className="w-full flex items-start md:items-center flex-col lg:flex-row gap-[16px] mt-5">
          <div className="flex-1 w-full relative">
            <Input
              placeholder="Search Orders"
              search
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-[16px] w-full lg:w-auto [&>div]:flex-1">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            />
            <Select
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
            />
          </div>
        </div>
      </div>
      <OrdersTable filters={{ search, status, type }} />
    </div>
  );
}

export default Orders;
