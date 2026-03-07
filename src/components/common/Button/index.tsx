"use client"
import React, { useRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
}

export default function Button({ children, variant = "primary", className = "", onClick, ...props }: ButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const baseStyles = "px-4 py-2 rounded-[8px] transition-colors duration-200 font-[500] cursor-pointer relative overflow-hidden";

    const variants = {
        primary: "bg-black text-white hover:bg-neutral-700  px-6 py-4",
        secondary: "bg-secondary text-black hover:bg-limeGreen",
        outline: "text-white hover:bg-secondary/20",
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
                className={`${baseStyles} ${variants[variant]} ${className}`}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        </>
    );
}