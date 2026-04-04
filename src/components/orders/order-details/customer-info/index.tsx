import React from "react";
import { Phone, MapPin } from "lucide-react";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";

interface OrderUser {
  "@context"?: string;
  "@id"?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

function CustomerInfo({
  user,
  isLoading,
}: {
  user?: OrderUser | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-0 w-full mx-0 h-[200px] flex items-center justify-center">
        <Loader size={32} className="text-gray-400" />
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="p-0 w-full mx-0">
      <h3 className="text-[16px] font-[600] text-black uppercase px-6 py-3 mb-0 border-b border-muted">
        Customer
      </h3>

      <div className="flex flex-col gap-[6px] px-6 py-6">
        <p className="text-[16px] font-[600] text-black mb-1">{user.name}</p>
        <p className="text-[13px] text-neutral mb-3">{user.email}</p>

        <div
          className="flex items-center gap-[12px] text-[13px] text-[#6B7280] mb-2"
          style={{ wordBreak: "break-all" }}
        >
          <Phone size={16} className="text-[#9CA3AF] shrink-0" />
          <span>{user.phone || "—"}</span>
        </div>

        <div className="flex items-start gap-[12px] text-[13px] text-[#6B7280]">
          <MapPin size={16} className="text-[#9CA3AF] shrink-0 mt-[2px]" />
          <span className="leading-[1.4]">{user.address || "—"}</span>
        </div>
      </div>
    </Card>
  );
}

export default CustomerInfo;
