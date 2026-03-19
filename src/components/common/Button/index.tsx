"use client";
import React, { useRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "disabled";
  isLoading?: boolean;
}

import { cn } from "@/utils/cn";
import Loader from "../Loader";
export default function Button({
  children,
  variant = "primary",
  className = "",
  isLoading,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const baseStyles =
    "px-[35px] py-[12px] text-[16px] rounded-[8px] transition-colors duration-200 font-[500] relative overflow-hidden [font-family:var(--font-poppins)] whitespace-nowrap";

  const variants = {
    primary: "bg-black text-white hover:bg-neutral-700 cursor-pointer",
    secondary: "bg-secondary text-black hover:bg-limeGreen cursor-pointer",
    outline: "text-white hover:bg-secondary/20 cursor-pointer",
    disabled: "bg-muted text-placeholder cursor-not-allowed",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
            position: absolute;
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.35);
            transform: scale(0);
            animation: ripple-effect 0.6s ease-out forwards;
            pointer-events: none;
        `;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    if (onClick) onClick(e);
  };

  return (
    <>
      <style>{`
                @keyframes ripple-effect {
                    to {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `}</style>
      <button
        ref={buttonRef}
        className={cn(
          baseStyles,
          variants[variant],
          className,
          isLoading ? "opacity-70 cursor-not-allowed" : ""
        )}
        onClick={isLoading ? undefined : handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading && <Loader size={20} />}
          {children}
        </div>
      </button>
    </>
  );
}
