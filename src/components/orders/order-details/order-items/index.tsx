"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import GenericTable from "@/components/common/GenericTable";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import FormDialog from "@/components/common/form-dailog";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { validateAndSetErrors } from "@/utils/validation";
import { openItemSchema, regularItemSchema } from "../../schema";
import { poundsToPence, penceToPounds } from "@/utils/helper";
import { Printer } from "lucide-react";
import Button from "@/components/common/Button";

interface OrderItem {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  item: any;
  quantity: number;
  cleaningMethod: string;
  pricePerUnit: number;
  totalPrice: number;
  openItemName: string | null;
  piece: number | null;
  isApproved: boolean | null;
}

interface ItemCategory {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  name: string;
  washingLabel: string;
}

interface RegularItemOption {
  id: string;
  atId: string;
  name: string;
  washingLabel: string;
  categoryId: string;
  priceWashing: number | null;
  priceDryCleaning: number | null;
}

interface OrderItemsData {
  totalItems: number;
  member: OrderItem[];
}

const cleaningMethodMap: Record<string, string> = {
  dry_cleaning: "Dry Cleaning",
  washing: "Wash",
  ironing: "Ironing",
  wash_fold: "Wash & Fold",
};

const cleaningMethodOptions = [
  { label: "Select", value: "" },
  { label: "Wash", value: "washing" },
  { label: "Dry Clean", value: "dry_cleaning" },
];

interface OrderInfoForPrint {
  orderNumber?: number;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  pickupDate?: string;
  dropoffDate?: string;
}

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
    const payload = {
      item: regularItemData.item,
      quantity: regularItemData.quantity ? Number(regularItemData.quantity) : 1,
      cleaningMethod: regularItemData.cleaningMethod,
      pricePerUnit: regularItemData.pricePerUnit
        ? poundsToPence(Number(regularItemData.pricePerUnit))
        : 0,
      order: `/orders/${orderId}`,
    };
    console.log("Regular Item Payload:", JSON.stringify(payload));
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

  const handlePrintTickets = () => {
    const totalRevenue = orderItems
      .reduce(
        (acc, item) => acc + (penceToPounds(Number(item.totalPrice)) || 0),
        0
      )
      .toFixed(2);

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "—";
      try {
        return new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const itemRows = orderItems
      .map((item) => {
        const itemName =
          item.item && typeof item.item === "object" && item.item.name
            ? item.item.name
            : item.openItemName
              ? item.openItemName
              : typeof item.item === "string"
                ? allItems.find(
                    (i) =>
                      i.atId === item.item || `/items/${i.id}` === item.item
                  )?.name || item.item
                : "—";
        const cleaningLabel =
          cleaningMethodMap[item.cleaningMethod] || item.cleaningMethod;
        const unitPrice = penceToPounds(item.pricePerUnit).toFixed(2);
        const totalPrice = penceToPounds(item.totalPrice).toFixed(2);
        return `
          <tr>
            <td>${itemName}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:center">${cleaningLabel}</td>
            <td style="text-align:right">£${unitPrice}</td>
            <td style="text-align:right">£${totalPrice}</td>
          </tr>
        `;
      })
      .join("");

    const orderNum = orderInfo?.orderNumber
      ? String(orderInfo.orderNumber).padStart(2, "0")
      : orderId.slice(0, 8).toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice – Order #${orderNum}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', sans-serif;
            color: #1a1a1a;
            background: #fff;
            padding: 40px 48px;
            font-size: 13px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 36px;
            padding-bottom: 24px;
            border-bottom: 2px solid #000;
          }
          .brand-name {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #000;
          }
          .brand-tagline {
            font-size: 11px;
            color: #666;
            margin-top: 3px;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-meta h2 {
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #000;
          }
          .invoice-meta p {
            font-size: 12px;
            color: #555;
            margin-top: 4px;
          }
          .invoice-meta .order-num {
            font-size: 14px;
            font-weight: 600;
            color: #000;
            margin-top: 6px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-block h4 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #888;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .info-block p {
            font-size: 13px;
            color: #222;
            line-height: 1.6;
          }
          .info-block p.name {
            font-weight: 700;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
          }
          thead tr {
            background: #000;
            color: #fff;
          }
          thead th {
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            text-align: left;
          }
          thead th:nth-child(2),
          thead th:nth-child(3) {
            text-align: center;
          }
          thead th:nth-child(4),
          thead th:nth-child(5) {
            text-align: right;
          }
          tbody tr {
            border-bottom: 1px solid #eee;
          }
          tbody tr:nth-child(even) {
            background: #f9f9f9;
          }
          tbody td {
            padding: 10px 12px;
            font-size: 13px;
            color: #333;
            vertical-align: top;
          }
          .totals-section {
            border-top: 2px solid #000;
            margin-top: 0;
            padding-top: 16px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            gap: 48px;
            font-size: 14px;
          }
          .total-row.grand {
            font-weight: 800;
            font-size: 16px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            margin-top: 4px;
          }
          .total-row span:first-child {
            color: #555;
          }
          .total-row.grand span:first-child {
            color: #000;
          }
          .footer {
            margin-top: 48px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer p {
            font-size: 11px;
            color: #888;
          }
          .thank-you {
            font-size: 13px;
            font-weight: 600;
            color: #000;
          }
          @media print {
            body { padding: 20px 30px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-name">Laundry Free</div>
            <div class="brand-tagline">Professional Laundry &amp; Dry Cleaning Service</div>
          </div>
          <div class="invoice-meta">
            <h2>Invoice</h2>
            <p class="order-num">Order #${orderNum}</p>
            <p>Date Issued: ${formatDate(orderInfo?.createdAt || new Date().toISOString())}</p>
            ${orderInfo?.pickupDate ? `<p>Pickup: ${formatDate(orderInfo.pickupDate)}</p>` : ""}
            ${orderInfo?.dropoffDate ? `<p>Dropoff: ${formatDate(orderInfo.dropoffDate)}</p>` : ""}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <h4>Billed To</h4>
            <p class="name">${orderInfo?.customerName || "—"}</p>
            <p>${orderInfo?.customerEmail || ""}</p>
            <p>${orderInfo?.customerPhone || ""}</p>
            <p>${orderInfo?.customerAddress || ""}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Service</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row grand">
            <span>Total Amount</span>
            <span>£${totalRevenue}</span>
          </div>
        </div>

        <div class="footer">
          <div>
            <p class="thank-you">Thank you for choosing Laundry Free!</p>
            <p style="margin-top:4px">For queries: support@laundryfree.co.uk</p>
          </div>
          <p>This is a computer-generated invoice.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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

  const renderOpenItemFormFields = () => (
    <div className="flex flex-col gap-[20px]">
      <div>
        <label className="text-black font-[500] text-[14px] mb-[8px] block">
          Item Name
        </label>
        <Input
          placeholder="e.g. Formal Shirt"
          value={openItemData.openItemName}
          onChange={(e) => {
            setOpenItemData((prev) => ({
              ...prev,
              openItemName: e.target.value,
            }));
            if (openItemErrors.openItemName)
              setOpenItemErrors((prev) => ({
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
              setOpenItemData((prev) => ({
                ...prev,
                quantity: val,
              }));
              if (openItemErrors.quantity)
                setOpenItemErrors((prev) => ({
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
              setOpenItemData((prev) => ({
                ...prev,
                piece: val,
              }));
              if (openItemErrors.piece)
                setOpenItemErrors((prev) => ({ ...prev, piece: "" }));
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
              setOpenItemData((prev) => ({
                ...prev,
                cleaningMethod: e.target.value,
              }));
              if (openItemErrors.cleaningMethod)
                setOpenItemErrors((prev) => ({
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
            placeholder="e.g. 5000"
            value={openItemData.pricePerUnit}
            onChange={(e) => {
              setOpenItemData((prev) => ({
                ...prev,
                pricePerUnit: e.target.value,
              }));
              if (openItemErrors.pricePerUnit)
                setOpenItemErrors((prev) => ({
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

  const renderRegularItemFormFields = () => (
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
            setRegularItemData((prev) => ({
              ...prev,
              item: "",
              cleaningMethod: "",
            }));
            if (regularItemErrors.category)
              setRegularItemErrors((prev) => ({
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
              setRegularItemData((prev) => ({
                ...prev,
                item: e.target.value,
                cleaningMethod: "",
              }));
              if (regularItemErrors.item)
                setRegularItemErrors((prev) => ({
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
              setRegularItemData((prev) => ({
                ...prev,
                quantity: val,
              }));
              if (regularItemErrors.quantity)
                setRegularItemErrors((prev) => ({
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
              setRegularItemData((prev) => ({
                ...prev,
                cleaningMethod: e.target.value,
              }));
              if (regularItemErrors.cleaningMethod)
                setRegularItemErrors((prev) => ({
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
            placeholder="e.g. 5000"
            value={regularItemData.pricePerUnit}
            onChange={(e) => {
              setRegularItemData((prev) => ({
                ...prev,
                pricePerUnit: e.target.value,
              }));
              if (regularItemErrors.pricePerUnit)
                setRegularItemErrors((prev) => ({
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

  const columns = [
    {
      accessor: (row: any) => {
        if (row.item && typeof row.item === "object" && row.item.name)
          return row.item.name;
        if (row.openItemName) return row.openItemName;
        if (row.name) return row.name;

        if (typeof row.item === "string") {
          const matched = allItems.find(
            (i) => i.atId === row.item || `/items/${i.id}` === row.item
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
      accessor: (row: OrderItem) => (row.isApproved ? "Yes" : "No"),
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
                {renderOpenItemFormFields()}
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
                      (i) =>
                        i.atId === row.item?.["@id"] || i.id === row.item?.id
                    );
                  } else if (typeof row.item === "string") {
                    matchedItem = itemsToSearch.find(
                      (i) =>
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
                {renderRegularItemFormFields()}
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
                {renderOpenItemFormFields()}
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
                {renderRegularItemFormFields()}
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

      <div>
        <GenericTable data={orderItems} columns={columns} isLoading={loading} />
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-10 px-4 md:px-6 py-4 md:py-6">
        <p className="text-[14px] md:text-[16px] font-[700] text-black">
          Total Revenue
        </p>
        <p className="text-[16px] font-[700] text-black">
          £
          {orderItems
            .reduce(
              (acc, item) =>
                acc + (penceToPounds(Number(item.totalPrice)) || 0),
              0
            )
            .toFixed(2)}
        </p>
      </div>
    </Card>
  );
}

export default OrderItems;
