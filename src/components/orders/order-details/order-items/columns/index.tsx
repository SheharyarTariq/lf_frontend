import React from "react";
import FormDialog from "@/components/common/form-dailog";
import { penceToPounds } from "@/utils/helper";
import { OrderItem } from "../types";
import { cleaningMethodMap } from "../constants";
import OpenItemForm from "../open-item-form";
import RegularItemForm from "../regular-item-form";

export const getColumns = ({
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
}: any) => [
  {
    accessor: (row: any) => {
      if (row.item && typeof row.item === "object" && row.item.name)
        return row.item.name;
      if (row.openItemName) return row.openItemName;
      if (row.name) return row.name;

      if (typeof row.item === "string") {
        const matched = allItems.find(
          (i: any) => i.atId === row.item || `/items/${i.id}` === row.item
        );
        return matched?.name || row.item;
      }

      return "-";
    },
    header: "Item Name",
    sortable: false,
  },
  {
    accessor: "quantity" as keyof OrderItem,
    header: "Quantity",
  },
  {
    accessor: (row: OrderItem) =>
      cleaningMethodMap[row.cleaningMethod] || row.cleaningMethod,
    header: "Cleaning Method",
    sortable: false,
  },
  {
    accessor: (row: OrderItem) =>
      `£${penceToPounds(row.pricePerUnit).toFixed(2)}`,
    header: "Unit Price",
    sortable: false,
  },
  {
    accessor: (row: OrderItem) =>
      `£${penceToPounds(row.totalPrice).toFixed(2)}`,
    header: "Total",
    sortable: false,
  },
  {
    accessor: (row: OrderItem) => {
      if (row.isApproved === false) return "No";
      return "Yes";
    },
    header: "Approved?",
    sortable: false,
  },
  {
    accessor: (row: OrderItem) => {
      const isOpenItem = !!row.openItemName;
      const canManage = !status || status.toLowerCase() === "created";

      return (
        <div className="flex items-center justify-end gap-[10px]">
          {!canManage ? (
            <img
              src="/assets/edit.svg"
              alt="Edit"
              className="cursor-not-allowed h-[26px] w-[26px] opacity-50 grayscale"
            />
          ) : isOpenItem ? (
            <FormDialog
              title="Edit Open Item"
              buttonText={
                <img
                  src="/assets/edit.svg"
                  alt="Edit"
                  className="cursor-pointer h-[26px] w-[26px]"
                />
              }
              saveButtonText="Save"
              onSubmit={() => handleUpdateOpenItem(row.id)}
              loading={updateLoading === row.id}
              triggerVariant="icon"
              onOpen={() => {
                setOpenItemErrors({});
                setOpenItemData({
                  openItemName: row.openItemName || "",
                  quantity: String(row.quantity),
                  piece: String(row.piece || 0),
                  cleaningMethod: row.cleaningMethod,
                  pricePerUnit: String(penceToPounds(row.pricePerUnit)),
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
          ) : (
            <FormDialog
              title="Edit Regular Item"
              buttonText={
                <img
                  src="/assets/edit.svg"
                  alt="Edit"
                  className="cursor-pointer h-[26px] w-[26px]"
                />
              }
              saveButtonText="Save"
              onSubmit={() => handleUpdateRegularItem(row.id)}
              loading={updateRegularLoading === row.id}
              triggerVariant="icon"
              onOpen={async () => {
                setRegularItemErrors({});
                const loadedItems = await fetchOptionsIfNeeded();
                const itemsToSearch = loadedItems?.length
                  ? loadedItems
                  : allItems;

                let matchedItem = null;
                if (typeof row.item === "object" && row.item !== null) {
                  matchedItem = itemsToSearch.find(
                    (i: any) =>
                      i.atId === row.item?.["@id"] || i.id === row.item?.id
                  );
                } else if (typeof row.item === "string") {
                  matchedItem = itemsToSearch.find(
                    (i: any) =>
                      i.atId === row.item || `/items/${i.id}` === row.item
                  );
                }

                if (matchedItem) {
                  setSelectedCategory(matchedItem.categoryId);
                  setRegularItemData({
                    item: matchedItem.atId,
                    quantity: String(row.quantity),
                    cleaningMethod: row.cleaningMethod,
                    pricePerUnit: String(penceToPounds(row.pricePerUnit)),
                  });
                }
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
          )}

          {!canManage ? (
            <img
              src="/assets/TrashDisabled.svg"
              alt="Delete"
              className="cursor-not-allowed h-[38px] w-[36px]"
            />
          ) : (
            <FormDialog
              title="Delete Item"
              buttonText={
                <img
                  src="/assets/TrashEnabled.svg"
                  alt="Delete"
                  className="cursor-pointer h-[38px] w-[36px]"
                />
              }
              saveButtonText="Yes"
              onSubmit={handleDeleteOrderItem}
              loading={isDeletingItem}
              triggerVariant="icon"
              submitVariant="delete"
              onOpen={() => setDeleteItemId(row.id)}
            >
              Are you sure you want to delete this item?
              <span className="mt-[8px] block">
                This action cannot be undone.
              </span>
            </FormDialog>
          )}
        </div>
      );
    },
    header: "Action",
    sortable: false,
    className: "text-right",
    isAction: true,
  },
];
