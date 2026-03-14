import React from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { Plus } from "lucide-react";
import OrdersTable from "./orders-table";

function Orders() {
  return (
    <div>
      <div className="px-[50px] mt-[51px]">
        <h1 className="text-[32px] font-[500] text-black">Orders</h1>
        <div className="w-full flex items-center gap-[24px] mt-5">
          <Input placeholder="Search Orders" search />
        </div>
      </div>
      <OrdersTable />
    </div>
  );
}

export default Orders;
