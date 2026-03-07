import { ChevronDown } from 'lucide-react';

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    options: Option[];
    placeholder?: string;
    startIcon?: React.ReactNode;
    fullWidth?: boolean;
}

function Select({ options, placeholder = "Select", startIcon, fullWidth = false, className = "", ...props }: SelectProps) {
    const baseStyles = `py-3 px-6 pr-14 appearance-none placeholder:font-[400] placeholder:text-[#C1C1C1] text-black border-muted border border-[1px] focus:outline-none rounded-[4px] bg-white cursor-pointer ${fullWidth ? 'w-full' : 'min-w-[305px]'}`;
    const iconStyles = startIcon ? "pl-10" : "";

    return (
        <div className={`relative ${fullWidth ? 'w-full' : 'w-fit'}`}>
            {startIcon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                    {startIcon}
                </div>
            )}
            <select
                className={`${baseStyles} ${iconStyles} ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral ">
                <ChevronDown size={20} color="black" />
            </div>
        </div>
    );
}

export default Select;
