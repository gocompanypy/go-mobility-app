import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, User, X, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="fixed inset-0 z-[2050] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-[#FFD700]/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="bg-black/90 w-full max-w-md rounded-3xl border border-[#FFD700]/30 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Timer Progress */}
                <div className="h-1.5 bg-gray-800 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-1000 ease-linear shadow-[0_0_10px_#FFD700]"
                        style={{ width: `${(timeLeft / timeoutSeconds) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/10 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 blur-3xl rounded-full -mr-16 -mt-16" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                    <User size={20} className="text-[#FFD700]" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-white">{trip.passenger_name}</p>
                                <div className="flex items-center gap-1 text-[#FFD700] text-sm font-medium">
                                    <Star size={12} fill="currentColor" />
                                    <span>4.8</span>
                                    <span className="text-gray-500 mx-1">•</span>
                                    <span className="text-gray-400">Hace 3 min</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 mb-1 inline-block">
                                <p className="text-xl font-black text-[#FFD700] tracking-tight">
                                    Gs. {trip.estimated_price?.toLocaleString('es-PY')}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">
                                {trip.estimated_distance?.toFixed(1)} km • {trip.estimated_duration} min
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="p-6 space-y-6 relative">
                    {/* Pickup */}
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-4 h-4 rounded-full border-2 border-[#FFD700] bg-[#FFD700]/20 shadow-[0_0_10px_#FFD700]" />
                            <div className="w-0.5 h-10 bg-gradient-to-b from-[#FFD700]/50 to-transparent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Punto de Recogida</p>
                            <p className="text-white text-base font-medium leading-snug">{trip.pickup_address}</p>
                            <p className="text-xs text-[#00D4B1] mt-1 font-mono">~5 min de distancia</p>
                        </div>
                    </div>

                    {/* Dropoff */}
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-4 h-4 rounded-full border-2 border-white bg-white/20" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Destino</p>
                            <p className="text-white text-base font-medium leading-snug">{trip.dropoff_address}</p>
                        </div>
                    </div>
                </div>

                {/* Time Warning */}
                <div className="px-6 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/5 border border-[#FFD700]/10">
                        <Clock size={14} className="text-[#FFD700] animate-pulse" />
                        <span className="text-[#FFD700] text-xs font-bold uppercase tracking-wider">
                            {timeLeft}s para aceptar
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 py-7 border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors font-semibold"
                        onClick={onReject}
                        disabled={isAccepting}
                    >
                        <X size={20} className="mr-2" />
                        Rechazar
                    </Button>
                    <Button
                        className="flex-[2] py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)' }}
                        onClick={handleAccept}
                        disabled={isAccepting}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isAccepting ? (
                                <span className="animate-pulse">Aceptando...</span>
                            ) : (
                                <>
                                    <Check size={24} strokeWidth={3} />
                                    Aceptar Viaje
                                </>
                            )}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
