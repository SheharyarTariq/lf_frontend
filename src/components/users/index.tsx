"use client";
import React, { useState, useEffect } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import UsersTable from "./users-table";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deleted", value: "deleted" },
  { label: "Deletion Requested", value: "deletion_requested" },
];

const SORT_OPTIONS = [
  { label: "Registered At (newest)", value: "registeredAt:desc" },
  { label: "Registered At (oldest)", value: "registeredAt:asc" },
  { label: "Name (A-Z)", value: "name:asc" },
  { label: "Name (Z-A)", value: "name:desc" },
];

function Users() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("registeredAt:desc");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px] mb-10">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black mb-8">
          Users
        </h1>
        <div className="w-full flex items-start md:items-center flex-col lg:flex-row gap-[16px]">
          <div className="flex-1 w-full relative">
            <Input
              placeholder="Search by user or address"
              search
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-[16px] w-full lg:w-auto">
            <div className="w-full sm:w-[220px] lg:w-[240px]">
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
                label="Status"
              />
            </div>
            <div className="w-full sm:w-[340px] lg:w-[380px]">
              <Select
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                fullWidth
                label="Sort By"
              />
            </div>
          </div>
        </div>
      </div>
      <UsersTable filters={{ search, status, sortBy }} />
    </div>
  );
}

export default Users;
