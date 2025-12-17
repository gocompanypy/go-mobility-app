import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function DriverRequestCard({
    trip,
    onAccept,
    onReject,
    timeoutSeconds = 15,
}) {
    const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            onReject?.();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onReject]);

    const handleAccept = async () => {
        setIsAccepting(true);
        await onAccept?.();
    };

    if (!trip) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1A1A2E] w-full max-w-md rounded-2xl border border-[#2D2D44] overflow-hidden animate-in zoom-in-95">
                {/* Timer Progress */}
                <div className="h-1 bg-[#252538]">
                    <div
                        className="h-full bg-[#00D4B1] transition-all duration-1000"
                        style={{ width: `${(timeLeft / timeoutSeconds) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="p-4 bg-[#00D4B1]/10 border-b border-[#2D2D44]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#00D4B1]/20 rounded-full flex items-center justify-center">
                                <User size={20} className="text-[#00D4B1]" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{trip.passenger_name}</p>
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    ⭐ 4.8
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-[#00D4B1]">
                                Gs. {trip.estimated_price?.toLocaleString('es-PY')}
                            </p>
                            <p className="text-xs text-gray-400">
                                {trip.estimated_distance?.toFixed(1)} km • {trip.estimated_duration} min
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="p-4 space-y-4">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="w-3 h-3 bg-[#00D4B1] rounded-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">RECOGIDA</p>
                            <p className="text-white">{trip.pickup_address}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-[#00D4B1]">~5 min</p>
                        </div>
                    </div>

                    {/* Line connector */}
                    <div className="ml-[5px] w-0.5 h-4 bg-gradient-to-b from-[#00D4B1] to-[#FF6B6B]" />

                    {/* Dropoff */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <div className="w-3 h-3 bg-[#FF6B6B] rounded-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">DESTINO</p>
                            <p className="text-white">{trip.dropoff_address}</p>
                        </div>
                    </div>
                </div>

                {/* Time Warning */}
                <div className="px-4 py-2 bg-[#252538] flex items-center justify-center gap-2">
                    <Clock size={16} className="text-[#FFB800]" />
                    <span className="text-[#FFB800] font-mono">
                        {timeLeft}s para responder
                    </span>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 py-6 border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={onReject}
                        disabled={isAccepting}
                    >
                        <X size={20} className="mr-2" />
                        Rechazar
                    </Button>
                    <Button
                        className="flex-1 py-6 bg-[#00D4B1] hover:bg-[#00B89C] text-black font-semibold"
                        onClick={handleAccept}
                        disabled={isAccepting}
                    >
                        {isAccepting ? (
                            'Aceptando...'
                        ) : (
                            <>
                                <Check size={20} className="mr-2" />
                                Aceptar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
