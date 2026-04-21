import React from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { cleaningMethodOptions } from "../constants";

interface OpenItemFormProps {
  openItemData: {
    openItemName: string;
    quantity: string;
    piece: string;
    cleaningMethod: string;
    pricePerUnit: string;
  };
  setOpenItemData: React.Dispatch<React.SetStateAction<any>>;
  openItemErrors: Record<string, string>;
  setOpenItemErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

export default function OpenItemForm({
  openItemData,
  setOpenItemData,
  openItemErrors,
  setOpenItemErrors,
}: OpenItemFormProps) {
  return (
    <div className="flex flex-col gap-[20px]">
      <div>
        <label className="text-black font-[500] text-[14px] mb-[8px] block">
          Item Name
        </label>
        <Input
          placeholder="e.g. Formal Shirt"
          value={openItemData.openItemName}
          onChange={(e) => {
            setOpenItemData((prev: any) => ({
              ...prev,
              openItemName: e.target.value,
            }));
            if (openItemErrors.openItemName)
              setOpenItemErrors((prev: any) => ({
                ...prev,
                openItemName: "",
              }));
          }}
          type="text"
          error={openItemErrors.openItemName}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-[20px]">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Quantity
          </label>
          <Input
            placeholder="1"
            value={openItemData.quantity}
            onChange={(e) => {
              const val = e.target.value;
              if (val && !/^\d+$/.test(val)) return;
              setOpenItemData((prev: any) => ({
                ...prev,
                quantity: val,
              }));
              if (openItemErrors.quantity)
                setOpenItemErrors((prev: any) => ({
                  ...prev,
                  quantity: "",
                }));
            }}
            type="number"
            error={openItemErrors.quantity}
          />
        </div>
        <div className="flex-1">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Pieces
          </label>
          <Input
            placeholder="e.g. 2"
            value={openItemData.piece}
            onChange={(e) => {
              const val = e.target.value;
              if (val && !/^\d+$/.test(val)) return;
              setOpenItemData((prev: any) => ({
                ...prev,
                piece: val,
              }));
              if (openItemErrors.piece)
                setOpenItemErrors((prev: any) => ({ ...prev, piece: "" }));
            }}
            type="number"
            error={openItemErrors.piece}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-[20px]">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Cleaning Method
          </label>
          <Select
            options={cleaningMethodOptions}
            placeholder="Select"
            value={openItemData.cleaningMethod}
            onChange={(e) => {
              setOpenItemData((prev: any) => ({
                ...prev,
                cleaningMethod: e.target.value,
              }));
              if (openItemErrors.cleaningMethod)
                setOpenItemErrors((prev: any) => ({
                  ...prev,
                  cleaningMethod: "",
                }));
            }}
            fullWidth
            error={openItemErrors.cleaningMethod}
          />
        </div>
        <div className="flex-1">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Price Per Unit
          </label>
          <Input
            placeholder="e.g. 50"
            value={openItemData.pricePerUnit}
            onChange={(e) => {
              setOpenItemData((prev: any) => ({
                ...prev,
                pricePerUnit: e.target.value,
              }));
              if (openItemErrors.pricePerUnit)
                setOpenItemErrors((prev: any) => ({
                  ...prev,
                  pricePerUnit: "",
                }));
            }}
            type="number"
            error={openItemErrors.pricePerUnit}
          />
        </div>
      </div>
    </div>
  );
}
