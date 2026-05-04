"use client";
import React from "react";
import Card from "@/components/common/Card";
import GenericTable from "@/components/common/GenericTable";
import FormDialog from "@/components/common/form-dailog";
import Button from "@/components/common/Button";
import { Printer } from "lucide-react";

import { useOrderItems } from "./use-order-items";
import { getColumns } from "./columns";
import OpenItemForm from "./open-item-form";
import RegularItemForm from "./regular-item-form";
import { OrderInfoForPrint } from "./types";
import { cleaningMethodMap } from "./constants";
import { penceToPounds } from "@/utils/helper";
import { printTickets } from "@/utils/print-tickets";

function OrderItems({
  orderId,
  revenue,
  onItemsChange,
  status,
  orderInfo,
}: {
  orderId: string;
  revenue: number;
  onItemsChange?: () => void;
  status?: string;
  orderInfo?: OrderInfoForPrint;
}) {
  const {
    orderItems,
    loading,

    // Open Item States
    openItemData,
    setOpenItemData,
    openItemErrors,
    setOpenItemErrors,
    createLoading,
    updateLoading,

    // Regular Item States
    itemCategories,
    allItems,
    regularItemData,
    setRegularItemData,
    regularItemErrors,
    setRegularItemErrors,
    createRegularLoading,
    updateRegularLoading,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    isOptionsLoading,

    // Delete states
    isDeletingItem,
    setDeleteItemId,

    // Handlers
    handleCreateOpenItem,
    handleCreateRegularItem,
    handleUpdateOpenItem,
    handleUpdateRegularItem,
    handleDeleteOrderItem,
    fetchOptionsIfNeeded,
    getRegularCleaningOptions,
  } = useOrderItems(orderId, onItemsChange);

  const columns = getColumns({
    status,
    allItems,
    itemCategories,
    updateLoading,
    updateRegularLoading,
    isDeletingItem,
    handleUpdateOpenItem,
    handleUpdateRegularItem,
    handleDeleteOrderItem,
    setDeleteItemId,
    openItemData,
    setOpenItemData,
    openItemErrors,
    setOpenItemErrors,
    regularItemData,
    setRegularItemData,
    regularItemErrors,
    setRegularItemErrors,
    selectedCategory,
    setSelectedCategory,
    fetchOptionsIfNeeded,
    isOptionsLoading,
    filteredItems,
    getRegularCleaningOptions,
  });

  const handlePrintTickets = () => {
    printTickets({
      orderItems,
      allItems,
      orderId,
      orderInfo,
      cleaningMethodMap,
    });
  };

  return (
    <Card className="mx-0 p-0 flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-muted py-4 md:py-6 px-4 md:px-6 gap-4 md:gap-0">
        <h3 className="text-[16px] md:text-[18px] font-[600] text-black uppercase ">
          Order Items
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-[10px] w-full md:w-auto [&>button]:w-full md:[&>button]:w-auto">
          <button
            onClick={handlePrintTickets}
            disabled={orderItems.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-[10px] md:px-[35px] md:py-[16px] text-[14px] md:text-[16px] rounded-[8px] font-[500] cursor-pointer transition-colors duration-200 [font-family:var(--font-poppins)] whitespace-nowrap bg-black text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            Print Tickets
          </button>
          {!status || status.toLowerCase() === "created" ? (
            <>
              <FormDialog
                title="Add Open Item"
                buttonText="Open Item"
                saveButtonText="Save"
                onSubmit={handleCreateOpenItem}
                loading={createLoading}
                onOpen={() => {
                  setOpenItemErrors({});
                  setOpenItemData({
                    openItemName: "",
                    quantity: "1",
                    piece: "",
                    cleaningMethod: "",
                    pricePerUnit: "",
                  });
                }}
              >
                <OpenItemForm
                  openItemData={openItemData}
                  setOpenItemData={setOpenItemData}
                  openItemErrors={openItemErrors}
                  setOpenItemErrors={setOpenItemErrors}
                />
              </FormDialog>
              <FormDialog
                title="Add Regular Item"
                buttonText="Regular Item"
                saveButtonText="Save"
                onSubmit={handleCreateRegularItem}
                loading={createRegularLoading}
                onOpen={() => {
                  setRegularItemErrors({});
                  setSelectedCategory("");
                  setRegularItemData({
                    item: "",
                    quantity: "1",
                    cleaningMethod: "",
                    pricePerUnit: "",
                  });
                  fetchOptionsIfNeeded();
                }}
              >
                <RegularItemForm
                  itemCategories={itemCategories}
                  isOptionsLoading={isOptionsLoading}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  regularItemData={regularItemData}
                  setRegularItemData={setRegularItemData}
                  regularItemErrors={regularItemErrors}
                  setRegularItemErrors={setRegularItemErrors}
                  filteredItems={filteredItems}
                  getRegularCleaningOptions={getRegularCleaningOptions}
                />
              </FormDialog>
            </>
          ) : (
            <>
              <Button
                variant="disabled"
                className="px-5 py-[10px] md:px-[35px] md:py-[16px] text-[14px] md:text-[16px]"
              >
                Open Item
              </Button>
              <Button
                variant="disabled"
                className="px-5 py-[10px] md:px-[35px] md:py-[16px] text-[14px] md:text-[16px]"
              >
                Regular Item
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-[20px] mx-[25px] mb-[30px]">
        <GenericTable data={orderItems} columns={columns} isLoading={loading} />
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-10 px-[25px] pb-[30px]">
        <p className="text-[14px] md:text-[16px] font-[700] text-black">
          Total Revenue
        </p>
        <p className="text-[16px] font-[700] text-black">
          £{(penceToPounds(Number(revenue)) || 0).toFixed(2)}
        </p>
      </div>
    </Card>
  );
}

export default OrderItems;
