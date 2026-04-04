import React from "react";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";

interface OrderPreferencesProps {
  shirtHandling?: string;
  allowDeepStainTreatment?: boolean;
  priceReview?: boolean;
  isLoading?: boolean;
}

export default function OrderPreferences({
  shirtHandling = "",
  allowDeepStainTreatment = false,
  priceReview = false,
  isLoading = false,
}: OrderPreferencesProps) {
  if (isLoading) {
    return (
      <Card className="p-0 w-full mx-0 h-[200px] flex items-center justify-center">
        <Loader size={32} className="text-gray-400" />
      </Card>
    );
  }

  return (
    <Card className="mx-0 w-full p-0 pb-[10px]">
      <h3 className="text-[16px] px-6 py-3 font-[600] text-black uppercase border-b border-muted m-0">
        Preferences
      </h3>
      <div className="flex flex-col px-6">
        <div className="flex justify-between items-center py-[14px] border-b border-muted gap-2">
          <span className="text-black text-[14px] font-[400] whitespace-nowrap overflow-hidden text-ellipsis">
            Shirt Handling
          </span>
          <span className="text-black text-[14px] font-[600] capitalize">
            {shirtHandling || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center py-[14px] border-b border-muted gap-2">
          <span className="text-black text-[14px] font-[400] whitespace-nowrap overflow-hidden text-ellipsis">
            Allow Deep Stain Treatment
          </span>
          <span className="text-black text-[14px] font-[600] capitalize">
            {allowDeepStainTreatment ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex justify-between items-center py-[14px] gap-2">
          <span className="text-black text-[14px] font-[400] whitespace-nowrap overflow-hidden text-ellipsis">
            Price Review
          </span>
          <span className="text-black text-[14px] font-[600] capitalize">
            {priceReview ? "On" : "Off"}
          </span>
        </div>
      </div>
    </Card>
  );
}
