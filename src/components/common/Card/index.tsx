import React, { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card: React.FC<PropsWithChildren<CardProps>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border-[1px] border-[#E5E7EB] rounded-[14px] mx-[30px] p-[30px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
