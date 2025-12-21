import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Simple custom Switch component
const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            ref={ref}
            className={twMerge(
                "w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D4B1] focus:ring-offset-2 focus:ring-offset-[#0F0F1A]",
                checked ? "bg-[#00D4B1]" : "bg-gray-700",
                className
            )}
            {...props}
        >
            <span
                className={twMerge(
                    "block w-4 h-4 rounded-full bg-white transition-transform transform translate-x-1",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
});
Switch.displayName = "Switch";

export { Switch };
