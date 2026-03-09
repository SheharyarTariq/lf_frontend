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
  color = "currentColor",
}: LoaderProps) {
  return (
    <Loader2
      size={size}
      color={color}
      className={`animate-spin ${className}`}
    />
  );
}
