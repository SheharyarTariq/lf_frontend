"use client";
import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function Loader({
  size = 24,
  className = "",
  color = "var(--loader-color)",
}: LoaderProps) {
  const dotSize = Math.max(4, size / 3.5);

  return (
    <div
      className={`flex items-center justify-center gap-[4px] ${className}`}
      style={{ height: size }}
    >
      <span
        className="animate-dots rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          animationDelay: "-0.32s",
        }}
      ></span>
      <span
        className="animate-dots rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
          animationDelay: "-0.16s",
        }}
      ></span>
      <span
        className="animate-dots rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
        }}
      ></span>
    </div>
  );
}
