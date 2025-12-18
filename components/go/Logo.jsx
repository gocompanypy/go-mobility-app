import React from 'react';
import { cn } from "@/lib/utils";

export default function Logo({ size = 'md', className }) {
    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    return (
        <div className={cn("flex items-center gap-1 font-bold", className)}>
            <span className={cn("text-[#00D4B1]", sizes[size])}>Go</span>
            <span className={cn("text-white", sizes[size])}>Mobility</span>
        </div>
    );
}
