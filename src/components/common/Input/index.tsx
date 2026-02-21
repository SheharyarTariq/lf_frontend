import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode;
    search?: boolean;
}

function Input({ startIcon, search, className = "", ...props }: InputProps) {
    const icon = search ? <Search size={24} color="#8F8F8F" /> : startIcon;
    const baseStyles = "py-4 px-6 placeholder:font-[400] placeholder:text-[#C1C1C1] text-black border-muted border border-[1px] focus:outline-neutral  rounded-[8px] w-full ";
    const iconStyles = icon ? "pl-12" : "";

    return (
        <div className="relative w-full">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                    {icon}
                </div>
            )}
            <input
                className={`${baseStyles} ${iconStyles} ${className}`}
                {...props}
            />
        </div>
    );
}

export default Input;