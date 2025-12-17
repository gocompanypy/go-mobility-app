import React from 'react';
import { Zap } from 'lucide-react';

export default function Logo({ size = 'md', showText = true, className = '' }) {
    const sizes = {
        sm: { icon: 20, text: 'text-xl' },
        md: { icon: 28, text: 'text-2xl' },
        lg: { icon: 40, text: 'text-4xl' },
        xl: { icon: 56, text: 'text-5xl' },
    };

    const { icon, text } = sizes[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] blur-xl opacity-60 rounded-full" />
                <div
                    className="relative bg-gradient-to-br from-[#FFD700] via-[#FFED4E] to-[#FFA500] p-2 rounded-xl"
                    style={{
                        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <Zap size={icon} className="text-black drop-shadow-lg" fill="black" />
                </div>
            </div>
            {showText && (
                <span
                    className={`font-black ${text} tracking-tight`}
                    style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFED4E 50%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.5))'
                    }}
                >
                    GO
                </span>
            )}
        </div>
    );
}
