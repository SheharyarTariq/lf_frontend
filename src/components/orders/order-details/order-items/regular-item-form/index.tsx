import React from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { ItemCategory, RegularItemOption } from "../types";

interface RegularItemFormProps {
  itemCategories: ItemCategory[];
  isOptionsLoading: boolean;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  regularItemData: {
    item: string;
    quantity: string;
    cleaningMethod: string;
    pricePerUnit: string;
  };
  setRegularItemData: React.Dispatch<React.SetStateAction<any>>;
  regularItemErrors: Record<string, string>;
  setRegularItemErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  filteredItems: RegularItemOption[];
  getRegularCleaningOptions: () => { label: string; value: string }[];
}

export default function RegularItemForm({
  itemCategories,
  isOptionsLoading,
  selectedCategory,
  setSelectedCategory,
  regularItemData,
  setRegularItemData,
  regularItemErrors,
  setRegularItemErrors,
  filteredItems,
  getRegularCleaningOptions,
}: RegularItemFormProps) {
  return (
    <div className="flex flex-col gap-[20px]">
      <div>
        <label className="text-black font-[500] text-[14px] mb-[8px] block">
          Category{" "}
          {isOptionsLoading && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              (Loading...)
            </span>
          )}
        </label>
        <Select
          options={itemCategories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))}
          placeholder="Select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setRegularItemData((prev: any) => ({
              ...prev,
              item: "",
              cleaningMethod: "",
            }));
            if (regularItemErrors.category)
              setRegularItemErrors((prev: any) => ({
                ...prev,
                category: "",
              }));
          }}
          fullWidth
          searchable
          error={regularItemErrors.category}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-[20px]">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Item
          </label>
          <Select
            options={filteredItems.map((item) => ({
              label: item.name,
              value: item.atId,
            }))}
            placeholder="Select"
            value={regularItemData.item}
            onChange={(e) => {
              setRegularItemData((prev: any) => ({
                ...prev,
                item: e.target.value,
                cleaningMethod: "",
              }));
              if (regularItemErrors.item)
                setRegularItemErrors((prev: any) => ({
                  ...prev,
                  item: "",
                }));
            }}
            fullWidth
            searchable
            disabled={!selectedCategory}
            error={regularItemErrors.item}
          />
        </div>
        <div className="flex-1">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Quantity
          </label>
          <Input
            placeholder="1"
            value={regularItemData.quantity}
            onChange={(e) => {
              const val = e.target.value;
              if (val && !/^\d+$/.test(val)) return;
              setRegularItemData((prev: any) => ({
                ...prev,
                quantity: val,
              }));
              if (regularItemErrors.quantity)
                setRegularItemErrors((prev: any) => ({
                  ...prev,
                  quantity: "",
                }));
            }}
            type="number"
            error={regularItemErrors.quantity}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-[20px]">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Cleaning Method
          </label>
          <Select
            options={getRegularCleaningOptions()}
            placeholder="Select"
            value={regularItemData.cleaningMethod}
            onChange={(e) => {
              setRegularItemData((prev: any) => ({
                ...prev,
                cleaningMethod: e.target.value,
              }));
              if (regularItemErrors.cleaningMethod)
                setRegularItemErrors((prev: any) => ({
                  ...prev,
                  cleaningMethod: "",
                }));
            }}
            fullWidth
            disabled={!regularItemData.item}
            error={regularItemErrors.cleaningMethod}
          />
        </div>
        <div className="flex-1">
          <label className="text-black font-[500] text-[14px] mb-[8px] block">
            Price Per Unit
          </label>
          <Input
            placeholder="e.g. 50"
            value={regularItemData.pricePerUnit}
            onChange={(e) => {
              setRegularItemData((prev: any) => ({
                ...prev,
                pricePerUnit: e.target.value,
              }));
              if (regularItemErrors.pricePerUnit)
                setRegularItemErrors((prev: any) => ({
                  ...prev,
                  pricePerUnit: "",
                }));
            }}
            type="number"
            error={regularItemErrors.pricePerUnit}
          />
        </div>
      </div>
    </div>
  );
}
