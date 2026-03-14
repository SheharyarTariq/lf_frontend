"use client";
import React, { useEffect } from "react";
import Input from "../common/Input";
function Users() {
  return (
    <div>
      <div className="px-[50px] mt-[51px]">
        <h1 className="text-[32px] font-[500] text-black">Users</h1>
        <div className="w-full flex items-center gap-[24px] mt-5">
          <Input placeholder="Search Users" search />
        </div>
      </div>
    </div>
  );
}

export default Users;
