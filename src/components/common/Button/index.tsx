interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
}

export default function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
    const baseStyles = "px-6 py-2 rounded-[8px] transition-colors duration-200 font-[500] cursor-pointer";

    const variants = {
        primary: "bg-black text-white hover:bg-neutral-800  px-6 py-4",
        secondary: "bg-secondary text-black hover:bg-[#D6FF4B]",
        outline: "border border-black text-black hover:bg-gray-50",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}