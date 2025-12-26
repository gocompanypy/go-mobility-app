import React from 'react';
import { cn } from "@/lib/utils";

export default function Logo({ size = 'md', className }) {
    const sizes = {
        sm: { container: 'h-10 w-10', text: 'text-[8px]', main: 'text-[12px]' },
        md: { container: 'h-16 w-16', text: 'text-[10px]', main: 'text-[18px]' },
        lg: { container: 'h-24 w-24', text: 'text-[14px]', main: 'text-[28px]' },
        xl: { container: 'h-32 w-32', text: 'text-[18px]', main: 'text-[36px]' }
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <div className={cn("flex flex-col items-center justify-center gap-0", className)}>
            <img
                src="/logo.png"
                alt="Go Company Logo"
                className={cn("object-contain", sizes[size]?.container || currentSize.container)}
            />
        </div>
    );
}
