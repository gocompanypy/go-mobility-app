import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Home, Briefcase, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Simulated addresses for demo
const DEMO_ADDRESSES = [
    { id: 1, address: 'Puerta del Sol, Madrid', lat: 40.4168, lng: -3.7038 },
    { id: 2, address: 'Gran Vía 28, Madrid', lat: 40.4200, lng: -3.7057 },
    { id: 3, address: 'Plaza Mayor, Madrid', lat: 40.4155, lng: -3.7074 },
    { id: 4, address: 'Aeropuerto Madrid-Barajas T4', lat: 40.4722, lng: -3.5608 },
    { id: 5, address: 'Estación de Atocha, Madrid', lat: 40.4065, lng: -3.6893 },
    { id: 6, address: 'Santiago Bernabéu, Madrid', lat: 40.4531, lng: -3.6883 },
    { id: 7, address: 'Retiro Park, Madrid', lat: 40.4153, lng: -3.6845 },
    { id: 8, address: 'Calle Serrano 50, Madrid', lat: 40.4295, lng: -3.6875 },
];

export default function AddressInput({
    type = 'pickup', // 'pickup' or 'dropoff'
    value = '',
    onChange,
    onSelect,
    savedPlaces = [],
    placeholder,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value);

    const filteredAddresses = search
        ? DEMO_ADDRESSES.filter(a =>
            a.address.toLowerCase().includes(search.toLowerCase())
        )
        : DEMO_ADDRESSES.slice(0, 5);

    const handleSelect = (address) => {
        setSearch(address.address);
        onChange?.(address.address);
        onSelect?.(address);
        setIsOpen(false);
    };

    const handleCurrentLocation = () => {
        // Simulate getting current location
        const currentLocation = {
            id: 0,
            address: 'Tu ubicación actual',
            lat: 40.4168,
            lng: -3.7038,
        };
        handleSelect(currentLocation);
    };

    return (
        <div className="relative">
            <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${type === 'pickup' ? 'bg-[#00D4B1]' : 'bg-[#FF6B6B]'
                    }`} />
                <Input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onChange?.(e.target.value);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || (type === 'pickup' ? '¿Dónde te recogemos?' : '¿A dónde vas?')}
                    className="pl-10 pr-10 py-6 bg-[#252538] border-[#2D2D44] text-white placeholder:text-gray-500 rounded-xl"
                />
                {search && (
                    <button
                        onClick={() => {
                            setSearch('');
                            onChange?.('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl shadow-xl overflow-hidden">
                    {/* Current Location Button */}
                    {type === 'pickup' && (
                        <button
                            onClick={handleCurrentLocation}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#252538] transition-colors border-b border-[#2D2D44]"
                        >
                            <div className="w-10 h-10 bg-[#00D4B1]/20 rounded-full flex items-center justify-center">
                                <Navigation size={18} className="text-[#00D4B1]" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Usar ubicación actual</p>
                                <p className="text-xs text-gray-400">GPS activado</p>
                            </div>
                        </button>
                    )}

                    {/* Saved Places */}
                    {savedPlaces.length > 0 && (
                        <div className="border-b border-[#2D2D44]">
                            <p className="px-4 py-2 text-xs text-gray-500 uppercase">Lugares guardados</p>
                            {savedPlaces.map((place, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(place)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#252538] transition-colors"
                                >
                                    <div className="w-10 h-10 bg-[#252538] rounded-full flex items-center justify-center">
                                        {place.name === 'Casa' ? <Home size={18} className="text-gray-400" /> :
                                            place.name === 'Trabajo' ? <Briefcase size={18} className="text-gray-400" /> :
                                                <Star size={18} className="text-gray-400" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white">{place.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{place.address}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    <div>
                        {search && <p className="px-4 py-2 text-xs text-gray-500 uppercase">Resultados</p>}
                        {filteredAddresses.map((addr) => (
                            <button
                                key={addr.id}
                                onClick={() => handleSelect(addr)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#252538] transition-colors"
                            >
                                <div className="w-10 h-10 bg-[#252538] rounded-full flex items-center justify-center">
                                    <MapPin size={18} className="text-gray-400" />
                                </div>
                                <p className="text-white text-left truncate">{addr.address}</p>
                            </button>
                        ))}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 text-gray-400 hover:text-white border-t border-[#2D2D44]"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
    );
}
