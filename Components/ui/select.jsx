import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ value, onValueChange, children, disabled }) => {
    // This is a simplified Mock Select. In a real app we'd use Radix UI.
    // Children handling here is tricky without context, so we'll do a hacky generic version
    // or just render a native select if possible, but the children are custom React components (SelectItem).

    // Better approach for mock: Clone children and pass onClick?
    // Start with a Context.

    const [open, setOpen] = React.useState(false);

    return (
        <div className="relative">
            <SelectContext.Provider value={{ value, onValueChange, setOpen }}>
                {children}
            </SelectContext.Provider>
        </div>
    );
};

const SelectContext = React.createContext({});

export const SelectTrigger = ({ children, className }) => {
    const { setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            className={`flex h-10 w-full items-center justify-between rounded-md border border-[#2D2D44] bg-[#252538] px-3 py-2 text-sm text-white ${className}`}
            onClick={() => setOpen(prev => !prev)}
        >
            {children}
            <ChevronDown size={16} className="opacity-50" />
        </button>
    );
};

export const SelectValue = () => {
    const { value } = React.useContext(SelectContext);
    // Hard to map value to label without iterating children. 
    // For now just show value or specific logic
    return <span>{value || 'Seleccionar...'}</span>;
};

export const SelectContent = ({ children, className }) => {
    // We need to consume state from context or parent to show/hide
    // But since SelectTrigger toggles state inside Select... wait, SelectTrigger logic above is incomplete.
    // Let's make SelectTrigger and SelectContent communicate via context.
    const { open } = React.useContext(SelectContext); // We need to expose 'open' from context

    // Wait, the Select provider needs to hold the 'open' state.
    // I updated Select above to perform this.

    if (!open) return null;

    return (
        <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#2D2D44] bg-[#1A1A2E] text-white shadow-md animate-in fade-in-80 ${className} top-full mt-1 w-full`}>
            <div className="p-1">
                {children}
            </div>
        </div>
    );
};

export const SelectItem = ({ value, children, className }) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext);
    return (
        <div
            className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-white/10 ${className}`}
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {/* Check icon if selected could go here */}
            </span>
            {children}
        </div>
    );
};
