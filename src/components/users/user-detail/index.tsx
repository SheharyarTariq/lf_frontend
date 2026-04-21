"use client";
import apiCall from "@/utils/api-call";
import BackArrow from "@/components/common/BackArrow";
import Loader from "@/components/common/Loader";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { routes } from "@/utils/routes";
import Card from "@/components/common/Card";
import RecentOrders, { Order } from "./recent-orders";
import { penceToPounds } from "@/utils/helper";

interface UserDetailData {
  id: string;
  email: string;
  phone: string;
  status: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressTown: string;
  addressCounty: string;
  shirtHandling: string;
  laundryBagClaimedAt: string;
  laundryBagDeliveredAt: string;
  priceReviewRequired: boolean;
  stainTreatmentEnabled: boolean;
  registeredAt: string;
  emailVerifiedAt: string;
  deletionRequestedAt: string | null;
  postcode: {
    postcodeString: string;
    isActive: boolean;
    area: {
      name: string;
    } | null;
  } | null;
  stripeCustomerId: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-[#D1FAE5] text-[#065F46]",
  deleted: "bg-[#FEE2E2] text-[#991B1B]",
  deletion_requested: "bg-[#FEF3C7] text-[#92400E]",
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-GB", options).replace(",", "");
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

function CardRow({
  label,
  value,
  isLast = false,
  valueClassName = "",
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={`flex items-start sm:items-center justify-between py-[14px] px-6 gap-[16px] ${
        !isLast ? "border-b border-muted" : ""
      }`}
    >
      <span className="text-[13px] font-[500] text-info-text shrink-0">
        {label}
      </span>
      <div
        className={`text-[13px] font-[600] text-black text-right break-words flex-1 flex justify-end ${valueClassName}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function UserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const getUserDetails = async () => {
    setIsLoading(true);
    const response = await apiCall<UserDetailData>({
      endpoint: routes.api.getUserDetails(userId),
      method: "GET",
    });
    if (response.success && response.data) {
      setUser(response.data);
    }
    setIsLoading(false);
  };

  const getUserOrders = async () => {
    setOrdersLoading(true);
    const response = await apiCall<{ member: Order[]; totalItems: number }>({
      endpoint: `${routes.api.getOrders}?exact[user.id][]=${userId}`,
      method: "GET",
    });
    if (response.success && response.data) {
      setRecentOrders(response.data.member);
      setTotalItems(response.data.totalItems);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (userId) {
      getUserDetails();
      getUserOrders();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={48} className="text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const statusLabel = user.status.replace(/_/g, " ");
  const statusStyle =
    statusStyles[user.status.toLowerCase()] || "bg-gray-100 text-gray-600";

  const totalSpent = recentOrders.reduce(
    (sum, order) => sum + (order.revenue || 0),
    0
  );

  return (
    <div className="px-[50px] pt-[27px] pb-10">
      <div className="flex flex-col md:flex-row justify-between border-b border-muted pb-[27px] mb-[30px] gap-4 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-[16px] ">
          <BackArrow />
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-black text-[24px] lg:text-[32px] font-[500] leading-none mt-1">
              User Detail
            </h1>
            <span
              className={`px-[20px] py-[6px] rounded-full text-[14px] font-[500] capitalize ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[50px]">
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-[20px]">
          <Card className="p-0 border border-muted shadow-none">
            <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-muted">
              <div className="w-[70px] h-[70px] rounded-full bg-black flex items-center justify-center text-[#BFFF00] text-[20px] font-[600] mb-4 tracking-wider">
                {getInitials(user.name)}
              </div>
              <h2 className="text-[18px] font-[600] text-black mb-1">
                {user.name}
              </h2>
              <p className="text-[14px] text-info-text font-[400]">
                {user.email}
              </p>
            </div>
            <div className="flex flex-col">
              <CardRow label="Phone" value={user.phone} />
              <CardRow
                label="Registered At"
                value={formatDate(user.registeredAt)}
              />
              <CardRow
                label="Email Verified"
                value={user.emailVerifiedAt ? "Yes" : "No"}
              />
              <CardRow
                label="Deletion Requested At"
                value={formatDate(user.deletionRequestedAt)}
                isLast
              />
            </div>
          </Card>

          <Card className="p-0 border border-muted shadow-none">
            <h3 className="text-[14px] font-[700] text-black uppercase px-6 py-[18px] border-b border-muted tracking-wide">
              ADDRESS
            </h3>
            <div className="flex flex-col">
              <CardRow label="Address Line 1" value={user.addressLine1} />
              <CardRow label="Address Line 2" value={user.addressLine2} />
              <CardRow label="Town" value={user.addressTown} />
              <CardRow label="County" value={user.addressCounty} />
              <CardRow label="Postcode" value={user.postcode?.postcodeString} />
              <CardRow label="Area" value={user.postcode?.area?.name} isLast />
            </div>
          </Card>

          <Card className="p-0 border border-muted shadow-none">
            <h3 className="text-[14px] font-[700] text-black uppercase px-6 py-[18px] border-b border-muted tracking-wide">
              PREFERENCES
            </h3>
            <div className="flex flex-col">
              <CardRow
                label="Shirt Handling"
                value={<span className="capitalize">{user.shirtHandling}</span>}
              />
              <CardRow
                label="Allow Deep Stain Treatment"
                value={user.stainTreatmentEnabled ? "Yes" : "No"}
              />
              <CardRow
                label="Price Review"
                value={user.priceReviewRequired ? "On" : "Off"}
                isLast
              />
            </div>
          </Card>
        </div>

        <div className="flex-1 flex flex-col gap-[30px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px]">
            <div className="flex flex-col gap-[20px]">
              <Card className="p-0 border border-muted shadow-none">
                <h3 className="text-[14px] font-[700] text-black uppercase px-6 py-[18px] border-b border-muted tracking-wide">
                  LAUNDRY BAG
                </h3>
                <div className="flex flex-col">
                  <CardRow
                    label="Claimed At"
                    value={formatDateTime(user.laundryBagClaimedAt)}
                  />
                  <CardRow
                    label="Delivered At"
                    value={formatDateTime(user.laundryBagDeliveredAt)}
                    isLast
                  />
                </div>
              </Card>

              <Card className="p-0 border border-muted shadow-none">
                <h3 className="text-[14px] font-[700] text-black uppercase px-6 py-[18px] border-b border-muted tracking-wide">
                  BILLING
                </h3>
                <div className="flex flex-col">
                  <CardRow
                    label="Stripe Customer ID"
                    value={
                      user.stripeCustomerId ? (
                        <span className="bg-gray-100 text-gray-600 px-[8px] py-[2px] rounded-[4px] text-[12px] font-[400]">
                          {user.stripeCustomerId}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                    isLast
                  />
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-0 border border-muted shadow-none h-full min-h-[196px] flex flex-col">
                <h3 className="text-[24px] font-[700] text-black px-6 py-[24px] border-b border-muted leading-none shrink-0">
                  Total Orders
                </h3>
                <div className="flex flex-col flex-1">
                  <div className="flex flex-1 items-center justify-between border-b border-muted px-6 py-4">
                    <span className="text-[20px] font-[600] text-info-text leading-none">
                      Total Orders
                    </span>
                    <span className="text-[28px] font-[700] text-black leading-none">
                      {String(totalItems).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between px-6 py-4">
                    <span className="text-[20px] font-[600] text-info-text leading-none">
                      Total Spent
                    </span>
                    <span className="text-[28px] font-[700] text-black leading-[36px]">
                      £{penceToPounds(totalSpent).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <RecentOrders userId={userId} />
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
