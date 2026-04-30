"use client";
import React, { useState } from "react";
import FeedbackTable from "./feedback-table";

function Feedback() {
  const [featuredOnly, setFeaturedOnly] = useState(false);

  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px] mb-10">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black mb-8">
          Feedback
        </h1>
        <div className="w-full flex items-center mb-4">
          <label className="inline-flex items-center justify-between w-[240px] rounded-[12px] border border-[#E5E7EB] px-[24px] py-[16px] cursor-pointer select-none hover:bg-gray-50 transition-colors">
            <span className="text-[18px] font-[500] text-black tracking-wide">
              Featured only
            </span>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-[20px] h-[20px] cursor-pointer accent-black rounded-[4px]"
            />
          </label>
        </div>
      </div>
      <FeedbackTable filters={{ featuredOnly }} />
    </div>
  );
}

export default Feedback;
