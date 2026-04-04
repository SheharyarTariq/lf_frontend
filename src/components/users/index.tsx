"use client";
import React, { useEffect } from "react";
import Input from "../common/Input";
function Users() {
  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px] mb-10">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black mb-8">
          Users
        </h1>
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-[16px] md:gap-[24px]">
          <Input placeholder="Search Users" search />
        </div>
      </div>
    </div>
  );
}

export default Users;
