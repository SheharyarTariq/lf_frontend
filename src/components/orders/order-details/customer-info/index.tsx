import React from "react";
import Image from "next/image";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
interface OrderUser {
  "@context"?: string;
  "@id"?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressTown?: string | null;
  addressCounty?: string | null;
  postcode?: {
    postcodeString?: string;
  } | null;
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

  const fullAddress =
    [
      user.addressLine1,
      user.addressLine2,
      user.addressTown,
      user.addressCounty,
      user.postcode?.postcodeString,
    ]
      .filter(Boolean)
      .join(", ") ||
    user.address ||
    "—";

  return (
    <Card className="p-0 w-full mx-0">
      <h3 className="text-[16px] font-[600] text-black uppercase px-6 py-3 mb-0 border-b border-muted">
        Customer
      </h3>

      <div className="flex flex-col gap-[6px] px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[16px] font-[600] text-black">{user.name}</p>
          {user["@id"] && (
            <Link
              href={`/users/${user["@id"].split("/")[2]}`}
              className="p-1 -my-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            >
              <ArrowRight size={20} className="text-black" />
            </Link>
          )}
        </div>
        <p className="text-[13px] text-info-text font-[500] mb-3">
          {user.email}
        </p>

        <div
          className="flex items-center gap-[12px] text-[13px] text-info-text font-[400] mb-2"
          style={{ wordBreak: "break-all" }}
        >
          <Image
            src="/assets/phone.svg"
            width={18}
            height={18}
            alt="Phone"
            className="shrink-0"
          />
          <span>{user.phone || "—"}</span>
        </div>

        <div className="flex items-start gap-[12px] text-[13px] text-info-text font-[400]">
          <Image
            src="/assets/address.svg"
            width={18}
            height={18}
            alt="Address"
            className="shrink-0 mt-[2px]"
          />
          <span className="leading-[1.4]">{fullAddress}</span>
        </div>
      </div>
    </Card>
  );
}

export default CustomerInfo;
