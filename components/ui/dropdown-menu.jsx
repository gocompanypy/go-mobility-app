import React, { useState, useContext, createContext } from 'react';

const DropdownContext = createContext({});

export const DropdownMenu = ({ children }) => {
    const [open, setOpen] = useState(false);
    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

export const DropdownMenuTrigger = ({ asChild, children }) => {
    const { setOpen } = useContext(DropdownContext);
    return (
        <div onClick={() => setOpen(prev => !prev)} className="cursor-pointer">
            {children}
        </div>
    );
};

export const DropdownMenuContent = ({ children, className }) => {
    const { open } = useContext(DropdownContext);
    if (!open) return null;
    return (
        <div className={`absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-[#2D2D44] bg-[#1A1A2E] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}>
            <div className="py-1">
                {children}
            </div>
        </div>
    );
};

export const DropdownMenuItem = ({ children, className, onClick }) => {
    const { setOpen } = useContext(DropdownContext);
    return (
        <button
            className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${className}`}
            onClick={(e) => {
                onClick && onClick(e);
                setOpen(false);
            }}
        >
            {children}
        </button>
    );
};

// Mock other components if needed
export const DropdownMenuLabel = ({ children }) => <div className="px-4 py-2 text-sm font-semibold">{children}</div>;
export const DropdownMenuSeparator = () => <div className="h-px bg-gray-700 my-1" />;
