"use client";
import React, { useEffect } from "react";
import Input from "../common/Input";
function Users() {
  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px]">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black">Users</h1>
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-[16px] md:gap-[24px] mt-5">
          <Input placeholder="Search Users" search />
        </div>
      </div>
    </div>
  );
}

export default Users;
