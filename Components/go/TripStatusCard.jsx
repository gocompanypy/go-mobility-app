import React, { useState } from 'react';
import { Phone, MessageCircle, X, Star, Navigation, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { theme } from './theme';
import PaymentModal from './PaymentModal';
import ReviewModal from './ReviewModal';

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
    const statusConfig = theme.tripStatuses[trip?.status] || theme.tripStatuses.searching;
    const vehicleConfig = theme.vehicleTypes[trip?.vehicle_type] || theme.vehicleTypes.economy;

    if (!trip) return null;

    const isActive = ['searching', 'accepted', 'arrived', 'in_progress'].includes(trip.status);
    const canCancel = ['searching', 'accepted', 'arrived'].includes(trip.status);
    const showRating = trip.status === 'completed' && !trip[`${userType}_rating`];

    return (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] overflow-hidden">
            {/* Status Header */}
            <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: `${statusConfig.color}20` }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{statusConfig.icon}</span>
                    <span className="font-medium" style={{ color: statusConfig.color }}>
                        {statusConfig.label}
                    </span>
                </div>
                {trip.status === 'in_progress' && (
                    <div className="flex items-center gap-1 text-[#00D4B1]">
                        <Navigation size={16} className="animate-pulse" />
                        <span className="text-sm">En ruta</span>
                    </div>
                )}
            </div>

            {/* Driver/Passenger Info */}
            {(trip.status !== 'searching' && trip.status !== 'no_drivers') && (
                <div className="p-4 border-b border-[#2D2D44]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#252538] rounded-full flex items-center justify-center text-2xl">
                                {vehicleConfig.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {userType === 'passenger' ? trip.driver_name : trip.passenger_name}
                                </p>
                                {userType === 'passenger' && trip.vehicle_plate && (
                                    <p className="text-sm text-[#00D4B1] font-mono">
                                        {trip.vehicle_plate}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <Star size={12} fill="currentColor" />
                                    <span>4.9</span>
                                </div>
                            </div>
                        </div>

                        {isActive && (
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full border-[#2D2D44] bg-[#252538] hover:bg-[#00D4B1] hover:border-[#00D4B1]"
                                    onClick={onChat}
                                >
                                    <MessageCircle size={18} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full border-[#2D2D44] bg-[#252538] hover:bg-[#00D4B1] hover:border-[#00D4B1]"
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
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-3 h-3 mt-1 bg-[#00D4B1] rounded-full" />
                    <div>
                        <p className="text-xs text-gray-400">Recogida</p>
                        <p className="text-white text-sm">{trip.pickup_address}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-3 h-3 mt-1 bg-[#FF6B6B] rounded-full" />
                    <div>
                        <p className="text-xs text-gray-400">Destino</p>
                        <p className="text-white text-sm">{trip.dropoff_address}</p>
                    </div>
                </div>
            </div>

            {/* Price */}
            <div className="px-4 py-3 bg-[#252538] flex items-center justify-between">
                <span className="text-gray-400">
                    {trip.status === 'completed' ? 'Total pagado' : 'Precio estimado'}
                </span>
                <span className="text-xl font-bold text-white">
                    Gs. {(trip.final_price || trip.estimated_price)?.toLocaleString('es-PY')}
                </span>
            </div>

            {/* Actions */}
            {(canCancel || showRating || (trip.status === 'completed' && userType === 'passenger' && trip.payment_status !== 'completed')) && (
                <div className="p-4 border-t border-[#2D2D44] space-y-2">
                    {trip.status === 'completed' && userType === 'passenger' && trip.payment_status !== 'completed' && (
                        <Button
                            className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-black"
                            onClick={() => setShowPayment(true)}
                        >
                            <CreditCard size={18} className="mr-2" />
                            Pagar viaje
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            variant="outline"
                            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={onCancel}
                        >
                            <X size={18} className="mr-2" />
                            Cancelar viaje
                        </Button>
                    )}

                    {showRating && trip.payment_status === 'completed' && (
                        <Button
                            className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-black"
                            onClick={() => setShowReview(true)}
                        >
                            <Star size={18} className="mr-2" />
                            Calificar {userType === 'passenger' ? 'conductor' : 'pasajero'}
                        </Button>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
                open={showPayment}
                onClose={() => setShowPayment(false)}
                amount={trip.final_price || trip.estimated_price}
                onPaymentComplete={async (data) => {
                    // Update payment status in the trip
                    console.log('Payment completed:', data);
                    setShowPayment(false);
                }}
            />

            {/* Review Modal */}
            <ReviewModal
                open={showReview}
                onClose={() => setShowReview(false)}
                trip={trip}
                userType={userType}
            />
        </div>
    );
}
