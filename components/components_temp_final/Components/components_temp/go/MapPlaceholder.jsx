import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function MapPlaceholder({
    pickupAddress,
    dropoffAddress,
    driverLocation,
    className = ''
}) {
    return (
        <div className={`relative bg-[#1A1A2E] rounded-xl overflow-hidden ${className}`}>
            {/* Simulated map background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
            linear-gradient(rgba(0,212,177,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,177,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Route visualization */}
            <div className="relative h-full flex flex-col items-center justify-center p-6">
                {pickupAddress && (
                    <div className="flex items-center gap-3 bg-[#252538] px-4 py-3 rounded-lg mb-2 w-full max-w-md">
                        <div className="w-3 h-3 bg-[#00D4B1] rounded-full" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">Recogida</p>
                            <p className="text-white text-sm truncate">{pickupAddress}</p>
                        </div>
                    </div>
                )}

                {pickupAddress && dropoffAddress && (
                    <div className="w-0.5 h-8 bg-gradient-to-b from-[#00D4B1] to-[#FF6B6B]" />
                )}

                {dropoffAddress && (
                    <div className="flex items-center gap-3 bg-[#252538] px-4 py-3 rounded-lg mt-2 w-full max-w-md">
                        <div className="w-3 h-3 bg-[#FF6B6B] rounded-full" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">Destino</p>
                            <p className="text-white text-sm truncate">{dropoffAddress}</p>
                        </div>
                    </div>
                )}

                {driverLocation && (
                    <div className="absolute top-4 right-4 bg-[#00D4B1] p-2 rounded-full animate-pulse">
                        <Navigation size={20} className="text-black" />
                    </div>
                )}

                {!pickupAddress && !dropoffAddress && (
                    <div className="text-center">
                        <MapPin size={48} className="text-[#00D4B1] mx-auto mb-3" />
                        <p className="text-gray-400">Selecciona origen y destino</p>
                    </div>
                )}
            </div>
        </div>
    );
}
