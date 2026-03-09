"use client";
import React from "react";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";

function SpecialNotes({
  note,
  isLoading,
}: {
  note?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="mx-0 w-full h-[120px] flex items-center justify-center">
        <Loader size={32} className="text-gray-400" />
      </Card>
    );
  }

  return (
    <Card className="mx-0 w-full">
      <h3 className="text-[13px] font-[600] text-black uppercase tracking-[1px] mb-[16px]">
        Special Notes
      </h3>
      <div className="border-l-[3px] border-[#F59E0B] bg-[#FFFBEB] rounded-r-[6px] px-[14px] py-[10px]">
        <p className="text-[13px] text-black">{note || "No special notes."}</p>
      </div>
    </Card>
  );
}

export default SpecialNotes;
