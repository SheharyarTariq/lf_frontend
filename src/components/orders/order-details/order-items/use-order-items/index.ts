import { useState, useEffect } from "react";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import { validateAndSetErrors } from "@/utils/validation";
import { openItemSchema, regularItemSchema } from "../../../schema";
import { poundsToPence, penceToPounds } from "@/utils/helper";
import {
  OrderItem,
  ItemCategory,
  RegularItemOption,
  OrderItemsData,
} from "../types";
import { cleaningMethodOptions } from "../constants";

export function useOrderItems(orderId: string, onItemsChange?: () => void) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [openItemData, setOpenItemData] = useState({
    openItemName: "",
    quantity: "",
    piece: "",
    cleaningMethod: "",
    pricePerUnit: "",
  });
  const [openItemErrors, setOpenItemErrors] = useState<Record<string, string>>(
    {}
  );
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<string>("");
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  const [allItems, setAllItems] = useState<RegularItemOption[]>([]);
  const [regularItemData, setRegularItemData] = useState({
    item: "",
    quantity: "1",
    cleaningMethod: "",
    pricePerUnit: "",
  });
  const [regularItemErrors, setRegularItemErrors] = useState<
    Record<string, string>
  >({});
  const [createRegularLoading, setCreateRegularLoading] = useState(false);
  const [updateRegularLoading, setUpdateRegularLoading] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredItems = selectedCategory
    ? allItems.filter((item) => item.categoryId === selectedCategory)
    : [];

  const getOrderItems = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    const response = await apiCall<OrderItemsData>({
      endpoint: routes.api.getOrderItems(orderId),
      method: "GET",
    });
    if (response.success && response?.data) {
      setOrderItems(response.data.member);
    }
    if (showLoader) setLoading(false);
  };

  const selectedItemData = allItems.find(
    (item) => item.atId === regularItemData.item
  );

  const getRegularCleaningOptions = () => {
    if (!selectedItemData) return cleaningMethodOptions;

    const options = [{ label: "Select", value: "" }];
    if (selectedItemData.priceWashing !== null) {
      options.push({ label: "Wash", value: "washing" });
    }
    if (selectedItemData.priceDryCleaning !== null) {
      options.push({ label: "Dry Clean", value: "dry_cleaning" });
    }
    return options.length > 1 ? options : cleaningMethodOptions;
  };

  const fetchAllItems = async (categories: ItemCategory[]) => {
    const itemsList: RegularItemOption[] = [];
    for (const category of categories) {
      const response = await apiCall<{
        member: {
          "@id"?: string;
          id: string;
          name: string;
          priceWashing: number | null;
          priceDryCleaning: number | null;
        }[];
      }>({
        endpoint: routes.api.getItemCategoryDetails(category.id),
        method: "GET",
      });
      if (response.success && response.data) {
        response.data.member.forEach((item) => {
          itemsList.push({
            id: item.id,
            atId: item["@id"] || `/items/${item.id}`,
            name: item.name,
            washingLabel: category.washingLabel,
            categoryId: category.id,
            priceWashing: item.priceWashing ?? null,
            priceDryCleaning: item.priceDryCleaning ?? null,
          });
        });
      }
    }
    setAllItems(itemsList);
    return itemsList;
  };

  const fetchOptionsIfNeeded = async () => {
    if (itemCategories.length > 0) return allItems;
    setIsOptionsLoading(true);
    const response = await apiCall<{ member: ItemCategory[] }>({
      endpoint: routes.api.getItemCategories,
      method: "GET",
    });
    if (response.success && response?.data) {
      setItemCategories(response.data.member);
      const itemsList = await fetchAllItems(response.data.member);
      setIsOptionsLoading(false);
      return itemsList;
    }
    setIsOptionsLoading(false);
    return [];
  };

  const handleCreateOpenItem = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        openItemSchema,
        {
          openItemName: openItemData.openItemName,
          quantity: openItemData.quantity
            ? Number(openItemData.quantity)
            : undefined,
          piece: openItemData.piece ? Number(openItemData.piece) : undefined,
          cleaningMethod: openItemData.cleaningMethod,
          pricePerUnit: openItemData.pricePerUnit
            ? Number(openItemData.pricePerUnit)
            : undefined,
        },
        setOpenItemErrors
      ))
    )
      return false;
    setCreateLoading(true);
    const response = await apiCall({
      endpoint: routes.api.createOpenItem,
      method: "POST",
      data: {
        openItemName: openItemData.openItemName.trim(),
        quantity: openItemData.quantity ? Number(openItemData.quantity) : 1,
        piece: openItemData.piece ? Number(openItemData.piece) : 0,
        cleaningMethod: openItemData.cleaningMethod,
        pricePerUnit: openItemData.pricePerUnit
          ? poundsToPence(Number(openItemData.pricePerUnit))
          : 0,
        order: `/orders/${orderId}`,
      },
      showSuccessToast: true,
      successMessage: "Open item created successfully",
    });
    setCreateLoading(false);
    if (response.success) {
      setOpenItemErrors({});
      setOpenItemData({
        openItemName: "",
        quantity: "",
        piece: "",
        cleaningMethod: "",
        pricePerUnit: "",
      });
      await getOrderItems(false);
      onItemsChange?.();
      return true;
    }
    return false;
  };

  const handleCreateRegularItem = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        regularItemSchema,
        {
          category: selectedCategory,
          item: regularItemData.item,
          quantity: regularItemData.quantity
            ? Number(regularItemData.quantity)
            : undefined,
          cleaningMethod: regularItemData.cleaningMethod,
          pricePerUnit: regularItemData.pricePerUnit
            ? Number(regularItemData.pricePerUnit)
            : undefined,
        },
        setRegularItemErrors
      ))
    )
      return false;

    setCreateRegularLoading(true);
    const payload = {
      item: regularItemData.item,
      quantity: regularItemData.quantity ? Number(regularItemData.quantity) : 1,
      cleaningMethod: regularItemData.cleaningMethod,
      pricePerUnit: regularItemData.pricePerUnit
        ? poundsToPence(Number(regularItemData.pricePerUnit))
        : 0,
      order: `/orders/${orderId}`,
    };

    const response = await apiCall({
      endpoint: routes.api.createRegularItem,
      method: "POST",
      data: payload,
      showSuccessToast: true,
      successMessage: "Regular item created successfully",
    });
    setCreateRegularLoading(false);
    if (response.success) {
      setRegularItemErrors({});
      setSelectedCategory("");
      setRegularItemData({
        item: "",
        quantity: "1",
        cleaningMethod: "",
        pricePerUnit: "",
      });
      await getOrderItems(false);
      onItemsChange?.();
      return true;
    }
    return false;
  };

  const handleUpdateOpenItem = async (id: string): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        openItemSchema,
        {
          openItemName: openItemData.openItemName,
          quantity: openItemData.quantity
            ? Number(openItemData.quantity)
            : undefined,
          piece: openItemData.piece ? Number(openItemData.piece) : undefined,
          cleaningMethod: openItemData.cleaningMethod,
          pricePerUnit: openItemData.pricePerUnit
            ? Number(openItemData.pricePerUnit)
            : undefined,
        },
        setOpenItemErrors
      ))
    )
      return false;
    setUpdateLoading(id);
    const response = await apiCall({
      endpoint: routes.api.updateOrderItem(id),
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      data: {
        openItemName: openItemData.openItemName.trim(),
        quantity: openItemData.quantity ? Number(openItemData.quantity) : 1,
        piece: openItemData.piece ? Number(openItemData.piece) : 0,
        cleaningMethod: openItemData.cleaningMethod,
        pricePerUnit: openItemData.pricePerUnit
          ? poundsToPence(Number(openItemData.pricePerUnit))
          : 0,
      },
      showSuccessToast: true,
      successMessage: "Open item updated successfully",
    });
    setUpdateLoading("");
    if (response.success) {
      setOpenItemErrors({});
      setOpenItemData({
        openItemName: "",
        quantity: "",
        piece: "",
        cleaningMethod: "",
        pricePerUnit: "",
      });
      await getOrderItems(false);
      onItemsChange?.();
      return true;
    }
    return false;
  };

  const handleUpdateRegularItem = async (id: string): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        regularItemSchema,
        {
          category: selectedCategory,
          item: regularItemData.item,
          quantity: regularItemData.quantity
            ? Number(regularItemData.quantity)
            : undefined,
          cleaningMethod: regularItemData.cleaningMethod,
          pricePerUnit: regularItemData.pricePerUnit
            ? Number(regularItemData.pricePerUnit)
            : undefined,
        },
        setRegularItemErrors
      ))
    )
      return false;

    const payload = {
      item: regularItemData.item,
      quantity: regularItemData.quantity ? Number(regularItemData.quantity) : 1,
      cleaningMethod: regularItemData.cleaningMethod,
      pricePerUnit: regularItemData.pricePerUnit
        ? poundsToPence(Number(regularItemData.pricePerUnit))
        : 0,
    };

    setUpdateRegularLoading(id);
    const response = await apiCall({
      endpoint: routes.api.updateOrderItem(id),
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      data: payload,
      showSuccessToast: true,
      successMessage: "Regular item updated successfully",
    });
    setUpdateRegularLoading("");
    if (response.success) {
      setRegularItemErrors({});
      setSelectedCategory("");
      setRegularItemData({
        item: "",
        quantity: "1",
        cleaningMethod: "",
        pricePerUnit: "",
      });
      await getOrderItems(false);
      onItemsChange?.();
      return true;
    }
    return false;
  };

  const handleDeleteOrderItem = async (): Promise<boolean> => {
    setIsDeletingItem(true);
    const response = await apiCall({
      endpoint: routes.api.deleteOrderItem(deleteItemId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Item deleted successfully",
    });
    setIsDeletingItem(false);
    if (response.success) {
      await getOrderItems(false);
      onItemsChange?.();
      return true;
    }
    return false;
  };

  useEffect(() => {
    getOrderItems();
  }, []);

  useEffect(() => {
    if (!regularItemData.item) return;
    const selectedItem = allItems.find((i) => i.atId === regularItemData.item);
    if (!selectedItem) return;
    const defaultMethod =
      selectedItem.priceWashing !== null &&
      selectedItem.priceDryCleaning === null
        ? "washing"
        : selectedItem.priceDryCleaning !== null &&
            selectedItem.priceWashing === null
          ? "dry_cleaning"
          : "";
    setRegularItemData((prev) => ({ ...prev, cleaningMethod: defaultMethod }));
  }, [regularItemData.item, allItems]);

  useEffect(() => {
    if (!regularItemData.item || !regularItemData.cleaningMethod) return;
    const selectedItem = allItems.find((i) => i.atId === regularItemData.item);
    if (!selectedItem) return;
    const price =
      regularItemData.cleaningMethod === "washing"
        ? selectedItem.priceWashing
        : regularItemData.cleaningMethod === "dry_cleaning"
          ? selectedItem.priceDryCleaning
          : null;
    if (price !== null) {
      setRegularItemData((prev) => ({
        ...prev,
        pricePerUnit: String(penceToPounds(price)),
      }));
    }
  }, [regularItemData.item, regularItemData.cleaningMethod, allItems]);

  return {
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
    deleteItemId,
    setDeleteItemId,

    // Handlers
    handleCreateOpenItem,
    handleCreateRegularItem,
    handleUpdateOpenItem,
    handleUpdateRegularItem,
    handleDeleteOrderItem,
    fetchOptionsIfNeeded,
    getRegularCleaningOptions,
  };
}
