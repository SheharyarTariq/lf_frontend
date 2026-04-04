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
    <Card className="mx-0 w-full p-0 overflow-hidden">
      <h3 className="text-[16px] px-6 py-3 font-[600] text-black uppercase border-b border-muted m-0">
        Special Notes
      </h3>
      <div className="p-6">
        <div className="border-l-[3px] border-[#F59E0B] bg-[#FFFBEB] px-4 py-4 rounded-r-[6px]">
          <p className="text-[14px] text-black leading-relaxed">
            {note || "No special notes."}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default SpecialNotes;
