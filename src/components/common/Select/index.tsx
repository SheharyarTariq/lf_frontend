"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/utils/cn";

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  options: Option[];
  placeholder?: string;
  startIcon?: React.ReactNode;
  fullWidth?: boolean;
  searchable?: boolean;
  error?: string;
}

function Select({
  options,
  placeholder = "Select",
  startIcon,
  fullWidth = false,
  searchable = false,
  error,
  className = "",
  onChange,
  value,
  disabled,
  ...props
}: SelectProps) {
  const baseStyles = "py-4 px-6 pr-14 appearance-none placeholder:font-[400] placeholder:text-[#C1C1C1] text-black border-muted border border-[1px] focus:outline-none rounded-[8px] bg-white cursor-pointer";
  const widthStyles = fullWidth ? "w-full" : "min-w-[305px]";
  const iconStyles = startIcon ? "pl-10" : "";

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!searchable) {
    return (
      <div className={cn(fullWidth ? "w-full" : "w-fit")}>
        <div className="relative">
          {startIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
              {startIcon}
            </div>
          )}
          <select
            className={cn(baseStyles, widthStyles, iconStyles, error ? "border-red-500" : "", className)}
            onChange={onChange}
            value={value}
            disabled={disabled}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral ">
            <ChevronDown size={20} color="black" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string | number) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn(fullWidth ? "w-full" : "w-fit")}>
      <div className={`relative w-full`} ref={dropdownRef}>
        <div
          ref={triggerRef}
          className={cn(
            baseStyles,
            widthStyles,
            iconStyles,
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className
          )}
          onClick={() => {
            if (disabled) return;
            if (!isOpen && triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
              });
            }
            setIsOpen(!isOpen);
          }}
        >
          <span className={`${!value ? "text-[#C1C1C1]" : "text-black"}`}>
            {selectedLabel}
          </span>
        </div>
        <div className="absolute right-4 top-[50%] -translate-y-1/2 pointer-events-none text-neutral">
          <ChevronDown size={20} color="black" />
        </div>
        {isOpen && (
          <div
            style={dropdownStyle}
            className="bg-white border border-muted rounded-[8px] shadow-lg max-h-[250px] flex flex-col"
          >
            <div className="p-2 border-b border-muted">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-9 pr-3 text-[14px] border border-muted rounded-[4px] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`py-2.5 px-4 text-[14px] cursor-pointer hover:bg-[#F5F5F5] transition-colors
                                        ${option.value === value ? "bg-muted text-black" : "text-black"}
                                        ${option.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                    onClick={() =>
                      !option.disabled && handleSelect(option.value)
                    }
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="py-3 px-4 text-[14px] text-neutral text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Select;
