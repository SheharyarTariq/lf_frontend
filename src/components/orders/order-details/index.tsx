"use client";
import apiCall from "@/utils/api-call";
import BackArrow from "@/components/common/BackArrow";
import Button from "@/components/common/Button";
import CustomerInfo from "./customer-info";
import SpecialNotes from "./special-notes";
import OrderInformation from "./order-information";
import OrderItems from "./order-items";
import FormDialog from "@/components/common/form-dailog";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { routes } from "@/utils/routes";

interface OrderSlot {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id?: string;
  startTime: string;
  endTime: string;
}

interface OrderUser {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface OrderItemData {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  item: {
    "@context"?: string;
    "@id"?: string;
    "@type"?: string;
    name: string;
    priceType: string;
  };
  quantity: number;
  cleaningMethod: string;
  pricePerUnit: number;
  totalPrice: number;
  openItemName: string;
  piece: number;
  isApproved: boolean;
}

interface OrderDetail {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  number: number;
  status: string;
  type: string;
  pickupDate: string;
  pickupSlot: OrderSlot;
  dropoffDate: string;
  dropoffSlot: OrderSlot;
  note: string;
  revenue: number;
  createdAt: string;
  user: OrderUser;
  orderItems: OrderItemData[];
}

const statusStyles: Record<string, string> = {
  created: "bg-[#E3ECF6] text-[#3A4F6C]",
  delivered: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
  processing: "bg-[#DBEAFE] text-[#1E40AF]",
  awaiting_review: "bg-[#FEF3C7] text-[#92400E]",
  payment_failed: "bg-[#FDE8E8] text-[#9B1C1C]",
  payment_pending: "bg-[#F3E8FF] text-[#6B21A8]",
};

function OrderDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params["order-details"] as string;
  const orderNumberParam = searchParams.get("number");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [finaliseLoading, setFinaliseLoading] = useState(false);

  const getOrderDetails = async () => {
    const response = await apiCall<OrderDetail>({
      endpoint: routes.api.getOrderDetails(orderId),
      method: "GET",
      headers: { Accept: "application/ld+json" },
    });
    if (response.success && response?.data) {
      setOrder(response.data);
    }
  };

  const handleCancelOrder = async (): Promise<boolean> => {
    setCancelLoading(true);
    const response = await apiCall({
      endpoint: routes.api.cancelOrder(orderId),
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      showSuccessToast: true,
      successMessage: "Order cancelled successfully",
      data: {},
    });
    setCancelLoading(false);
    if (response.success) {
      await getOrderDetails();
      return true;
    }
    return false;
  };

  const handleFinaliseOrder = async (): Promise<boolean> => {
    setFinaliseLoading(true);
    const response = await apiCall({
      endpoint: routes.api.finaliseOrder(orderId),
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      showSuccessToast: true,
      successMessage: "Order finalised successfully",
      data: {},
    });
    setFinaliseLoading(false);
    if (response.success) {
      await getOrderDetails();
      return true;
    }
    return false;
  };

  useEffect(() => {
    getOrderDetails();
  }, []);

  const isCancelled = order
    ? order.status.toLowerCase() === "cancelled"
    : false;
  const hasOrderItems = order
    ? order.orderItems && order.orderItems.length > 0
    : false;
  const statusLabel = order ? order.status.replace(/-/g, " ") : "";
  const statusStyle = order
    ? statusStyles[order.status.toLowerCase()] || "bg-gray-100 text-gray-600"
    : "";

  return (
    <div className="px-4 md:px-[30px] pt-6 md:pt-3 pb-10">
      <div className="flex flex-col md:flex-row justify-between border-b border-muted mb-7 gap-4 md:gap-0 pb-4 md:pb-0">
        <div className="flex items-start md:items-center justify-between w-full md:w-auto gap-[16px] ">
          <BackArrow />
          <div className="flex flex-col sm:flex-row items-end md:items-center gap-2 sm:gap-[20px] lg:gap-[50px] flex-1">
            <h1 className="text-black text-[24px] lg:text-[32px] font-[500]">
              Order #
              {orderNumberParam || order?.number
                ? String(orderNumberParam || order?.number).padStart(2, "0")
                : orderId}
            </h1>
            {order && (
              <span
                className={`px-[14px] py-[5px] rounded-full text-[14px] font-[500] capitalize ${statusStyle}`}
              >
                {statusLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 md:mt-[20px] mx-0 md:mx-[30px] mb-2 md:mb-[30px] gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {!isCancelled ? (
              <FormDialog
                title="Cancel Order"
                buttonText="Delete"
                saveButtonText="Yes"
                onSubmit={handleCancelOrder}
                loading={cancelLoading}
                triggerVariant="delete-outline"
                submitVariant="delete"
                triggerClassName="min-w-[140px] md:min-w-[160px] text-center"
              >
                Are you sure you want to cancel this order?
              </FormDialog>
            ) : (
              <Button
                variant="disabled"
                className="min-w-[140px] md:min-w-[160px] md:py-[16px] text-center"
                onClick={() =>
                  toast.error("This order is already cancelled", {
                    id: "cancel-error",
                  })
                }
              >
                Delete
              </Button>
            )}
            {hasOrderItems ? (
              <FormDialog
                title="Finalize Order"
                buttonText="Finalize"
                saveButtonText="Confirm"
                onSubmit={handleFinaliseOrder}
                loading={finaliseLoading}
                triggerClassName="min-w-[140px] md:min-w-[160px] text-center"
              >
                Are you sure you want to finalize this order?
              </FormDialog>
            ) : (
              <Button
                variant="disabled"
                className="min-w-[140px] md:min-w-[160px] md:py-[16px] text-center"
                onClick={() =>
                  toast.error("Add an Item First TO Finalise The Order", {
                    id: "finalise-error",
                  })
                }
              >
                Finalize
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-[24px] mx-0 md:mx-[30px]">
        <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-[20px]">
          <CustomerInfo user={order?.user} isLoading={!order} />
          <SpecialNotes note={order?.note} isLoading={!order} />
          <OrderInformation
            createdAt={order?.createdAt || ""}
            pickupDate={order?.pickupDate || ""}
            pickupSlot={order?.pickupSlot ?? null}
            dropoffDate={order?.dropoffDate || ""}
            dropoffSlot={order?.dropoffSlot ?? null}
            isLoading={!order}
          />
        </div>
        <div className="flex-1">
          <OrderItems
            orderId={orderId}
            revenue={order?.revenue || 0}
            onItemsChange={getOrderDetails}
          />
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
