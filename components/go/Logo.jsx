import React from 'react';
import { cn } from "@/lib/utils";

export default function Logo({ size = 'md', className }) {
    const sizes = {
        sm: { container: 'h-10 w-10', text: 'text-[8px]', main: 'text-[12px]' },
        md: { container: 'h-16 w-16', text: 'text-[10px]', main: 'text-[18px]' },
        lg: { container: 'h-24 w-24', text: 'text-[14px]', main: 'text-[28px]' }
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-0", className)}>
            {/* Logo Icon Layer */}
            <div className={cn(
                "relative flex items-center justify-center rounded-full border-[3px] border-[#FFD700] p-1 bg-black shadow-[0_0_15px_rgba(255,215,0,0.3)]",
                sizes[size].container
            )}>
                {/* Double Ring Effect */}
                <div className="absolute inset-[1px] rounded-full border border-[#FFD700]/50" />

                {/* Main GO Text with Arrow */}
                <div className="relative flex items-center">
                    <span className={cn("font-black tracking-tighter bg-gradient-to-b from-[#FFD700] via-[#FFED4E] to-[#FFA500] bg-clip-text text-transparent", sizes[size].main)} style={{ lineHeight: 1 }}>
                        G
                    </span>
                    <div className="mx-[-2px] flex items-center justify-center">
                        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-[0.5px]">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className={cn("font-black tracking-tighter bg-gradient-to-b from-[#FFD700] via-[#FFED4E] to-[#FFA500] bg-clip-text text-transparent", sizes[size].main)} style={{ lineHeight: 1 }}>
                        O
                    </span>
                </div>
            </div>

            {/* Company & Slogan */}
            <div className="flex flex-col items-center mt-1">
                <span className={cn("font-bold tracking-[0.2em] text-[#FFD700] uppercase", sizes[size].text)}>
                    COMPANY
                </span>
                <span className="text-[6px] text-gray-500 font-medium uppercase tracking-[0.1em] opacity-80">
                    Tu tiempo te pertenece
                </span>
            </div>
        </div>
    );
}
