import React from 'react';
import { Phone, MessageCircle, X, Navigation, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TripStatusCard = ({ trip, userType = 'passenger', onCancel, onChat, onCall, onRate }) => {
    if (!trip) return null;

    const isDriver = userType === 'driver';
    const targetName = isDriver ? trip.passenger_name : trip.driver_name;
    const targetPhone = isDriver ? trip.passenger_phone : trip.driver_phone;

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'searching': return 'text-yellow-500';
            case 'accepted': return 'text-blue-500';
            case 'arrived': return 'text-green-500';
            case 'in_progress': return 'text-emerald-500';
            default: return 'text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'searching': return 'Buscando conductor...';
            case 'accepted': return 'Conductor en camino';
            case 'arrived': return 'El conductor ha llegado';
            case 'in_progress': return 'Viaje en curso';
            case 'completed': return 'Viaje finalizado';
            default: return status;
        }
    };

    const openNavigation = (app) => {
        const lat = isDriver ? trip.dropoff_lat : trip.driver_lat; // If driver, nav to dropoff. If passenger, maybe track driver?
        const lng = isDriver ? trip.dropoff_lng : trip.driver_lng;
        // Logic usually: Nav to destination (dropoff)
        const destLat = trip.dropoff_lat;
        const destLng = trip.dropoff_lng;

        if (app === 'waze') {
            window.open(`https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`, '_blank');
        } else if (app === 'google') {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, '_blank');
        }
    };

    return (
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2D2D44] shadow-2xl animate-in slide-in-from-bottom-4">
            {/* Header: Status & Price */}
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse",
                        trip.status === 'searching' ? "bg-yellow-500" : "bg-[#00D4B1]"
                    )} />
                    <span className={cn("font-bold", getStatusColor(trip.status))}>
                        {getStatusText(trip.status)}
                    </span>
                </div>
                <div className="text-right">
                    <span className="font-bold text-white text-lg">Gs. {trip.estimated_price?.toLocaleString()}</span>
                </div>
            </div>

            {/* Driver/Passenger Info */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center border-2 border-[#FFD700]">
                    <span className="text-xl font-bold text-[#FFD700]">{targetName?.[0]}</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{targetName}</h3>
                    {!isDriver && trip.vehicle_type && (
                        <p className="text-gray-400 text-sm">
                            {trip.vehicle_color} {trip.vehicle_model} • {trip.vehicle_plate}
                        </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-[#FFD700] text-xs">★ 4.9</span>
                        <span className="text-gray-500 text-xs">• 3.2 km</span>
                    </div>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <Button variant="outline" size="icon" className="w-full bg-[#252538] border-0 hover:bg-[#2D2D44] text-white" onClick={onCall}>
                    <Phone size={20} />
                </Button>
                <Button variant="outline" size="icon" className="w-full bg-[#252538] border-0 hover:bg-[#2D2D44] text-white" onClick={onChat}>
                    <MessageCircle size={20} />
                </Button>
                <Button variant="outline" size="icon" className="w-full bg-[#252538] border-0 hover:bg-[#2D2D44] text-white" onClick={() => alert('Compartir viaje')}>
                    <Shield size={20} />
                </Button>
                <Button variant="destructive" size="icon" className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border-0" onClick={onCancel}>
                    <X size={20} />
                </Button>
            </div>

            {/* Navigation Buttons (New Feature) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-[#252538] border-[#2D2D44] text-white hover:bg-[#2D2D44]"
                    onClick={() => openNavigation('google')}
                >
                    <MapPin size={16} className="text-red-500" />
                    Google Maps
                </Button>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-[#252538] border-[#2D2D44] text-white hover:bg-[#2D2D44]"
                    onClick={() => openNavigation('waze')}
                >
                    <Navigation size={16} className="text-blue-400" />
                    Waze
                </Button>
            </div>
        </div>
    );
};

export default TripStatusCard;
