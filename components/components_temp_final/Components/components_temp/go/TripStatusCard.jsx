import React, { useState } from 'react';
import { Phone, MessageCircle, X, Star, Navigation, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { theme } from './theme';
import { formatCurrency } from '@/lib/utils';
import PaymentModal from './PaymentModal';
import ReviewModal from './ReviewModal';
import SafetyToolkit from './SafetyToolkit';

export default function TripStatusCard({
    trip,
    onCancel,
    onChat,
    onCall,
    onRate,
    userType = 'passenger' // 'passenger' or 'driver'
}) {
    const [showPayment, setShowPayment] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Status colors mapping for the new premium theme
    const statusTheme = {
        searching: { color: '#FFD700', label: 'Buscando...' },
        accepted: { color: '#00D4B1', label: 'Aceptado' },
        arrived: { color: '#FFA500', label: 'Conductor llegó' },
        in_progress: { color: '#3B82F6', label: 'En viaje' },
        completed: { color: '#10B981', label: 'Completado' },
        cancelled_passenger: { color: '#EF4444', label: 'Cancelado' },
        cancelled_driver: { color: '#EF4444', label: 'Cancelado' }
    };

    const currentStatus = statusTheme[trip?.status] || statusTheme.searching;
    const vehicleConfig = theme.vehicleTypes[trip?.vehicle_type] || theme.vehicleTypes.economy;

    if (!trip) return null;

    const isActive = ['searching', 'accepted', 'arrived', 'in_progress'].includes(trip.status);
    const canCancel = ['searching', 'accepted', 'arrived'].includes(trip.status);
    const showRating = trip.status === 'completed' && !trip[`${userType}_rating`];

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            {/* Status Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 relative bg-white/5">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentStatus.color }} />
                        <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: currentStatus.color }} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">
                        {currentStatus.label}
                    </span>
                </div>

                <SafetyToolkit className="text-gray-400 hover:text-white transition-colors" />
            </div>

            {/* Driver/Passenger Info */}
            {(trip.status !== 'searching' && trip.status !== 'no_drivers') && (
                <div className="p-5 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1A1A1A] to-black rounded-full border border-white/10 flex items-center justify-center text-2xl shadow-lg relative">
                                {vehicleConfig.icon}
                                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center bg-[#FFD700]">
                                    <Star size={10} className="text-black fill-current" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg leading-tight">
                                    {userType === 'passenger' ? trip.driver_name : trip.passenger_name}
                                </p>
                                {userType === 'passenger' && trip.vehicle_plate && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 tracking-wider">
                                            {trip.vehicle_plate}
                                        </span>
                                        <span className="text-xs text-gray-500">• {trip.vehicle_model || 'Toyota Vitz'}</span>
                                    </div>
                                )}
                                {userType === 'driver' && (
                                    <p className="text-xs text-[#FFD700] mt-1 font-medium">Cliente VIP</p>
                                )}
                            </div>
                        </div>

                        {isActive && (
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="w-10 h-10 rounded-full border-white/10 bg-white/5 hover:bg-[#FFD700] hover:border-[#FFD700] hover:text-black transition-all duration-300"
                                    onClick={onChat}
                                >
                                    <MessageCircle size={18} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="w-10 h-10 rounded-full border-white/10 bg-white/5 hover:bg-[#FFD700] hover:border-[#FFD700] hover:text-black transition-all duration-300"
                                    onClick={onCall}
                                >
                                    <Phone size={18} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Trip Details */}
            <div className="p-5 space-y-5 relative">
                {/* Connector Line */}
                <div className="absolute left-[29px] top-[34px] bottom-[34px] w-0.5 bg-gradient-to-b from-[#FFD700]/50 to-white/20" />

                <div className="flex items-start gap-4 relative">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full border-2 border-[#FFD700] bg-black shadow-[0_0_8px_#FFD700] z-10 shrink-0" />
                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Recogida</p>
                        <p className="text-white text-sm font-medium leading-normal">{trip.pickup_address}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 relative">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full border-2 border-white bg-black z-10 shrink-0" />
                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Destino</p>
                        <p className="text-white text-sm font-medium leading-normal">{trip.dropoff_address}</p>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            {(canCancel || showRating || (trip.status === 'completed' && userType === 'passenger' && trip.payment_status !== 'completed')) ? (
                <div className="p-4 bg-white/5 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Total estimado</p>
                        <p className="text-xl font-bold text-[#FFD700]">{formatCurrency(trip.final_price || trip.estimated_price)}</p>
                    </div>

                    {trip.status === 'completed' && userType === 'passenger' && trip.payment_status !== 'completed' && (
                        <Button
                            className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-black font-bold h-12 rounded-xl"
                            onClick={() => setShowPayment(true)}
                        >
                            <CreditCard size={18} className="mr-2" />
                            Pagar viaje
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            variant="ghost"
                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 rounded-xl text-sm"
                            onClick={onCancel}
                        >
                            Cancelar viaje
                        </Button>
                    )}

                    {showRating && trip.payment_status === 'completed' && (
                        <Button
                            className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-black font-bold h-12 rounded-xl"
                            onClick={() => setShowReview(true)}
                        >
                            <Star size={18} className="mr-2" />
                            Calificar {userType === 'passenger' ? 'conductor' : 'pasajero'}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-medium">
                        {trip.status === 'completed' ? 'Total pagado' : 'Precio estimado'}
                    </span>
                    <span className="text-xl font-black text-[#FFD700] tracking-tight">
                        {formatCurrency(trip.final_price || trip.estimated_price)}
                    </span>
                </div>
            )}

            {/* Modals */}
            <PaymentModal
                open={showPayment}
                onClose={() => setShowPayment(false)}
                amount={trip.final_price || trip.estimated_price}
                onPaymentComplete={async (data) => {
                    console.log('Payment completed:', data);
                    setShowPayment(false);
                }}
            />

            <ReviewModal
                open={showReview}
                onClose={() => setShowReview(false)}
                trip={trip}
                userType={userType}
            />
        </div>
    );
}
