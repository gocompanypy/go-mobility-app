import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Simple HTML5 Range fallback if Radix is not installed, or use standard implementation
// Since I don't know if Radix is installed, I'll assume it IS NOT and build a pure React/Tailwind slider
// to ensure it works without npm install errors.

const Slider = React.forwardRef(({ className, min, max, step, value, onValueChange, ...props }, ref) => {
    const handleChange = (e) => {
        onValueChange([parseFloat(e.target.value)]);
    };

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value?.[0] || 0}
            onChange={handleChange}
            ref={ref}
            className={twMerge(
                "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00D4B1]",
                className
            )}
            {...props}
        />
    );
});
Slider.displayName = "Slider";

export { Slider };
