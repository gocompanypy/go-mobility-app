import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, formatCurrency } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DriverHistory() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const user = await goApp.auth.me();
            if (!user) return;

            const drivers = await goApp.entities.Driver.filter({ id: user.id }); // Assuming ID matches or filter by user
            if (drivers.length > 0) {
                const tripData = await goApp.entities.Trip.filter({
                    driver_id: drivers[0].id,
                    status: ['completed', 'cancelled_passenger', 'cancelled_driver']
                });
                setTrips(tripData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => navigate(createPageUrl('DriverHome'))}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-200" />
                    </button>
                    <h1 className="text-xl font-bold">Historial de Viajes</h1>
                </div>
            </header>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-10">Cargando historial...</div>
                ) : trips.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>No tienes viajes registrados aún.</p>
                    </div>
                ) : (
                    trips.map(trip => (
                        <div key={trip.id} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 hover:bg-[#202025] transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono mb-1">
                                        <Calendar size={12} />
                                        {format(new Date(trip.created_at), "d MMMM, yyyy", { locale: es })}
                                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                        <Clock size={12} />
                                        {format(new Date(trip.created_at), "HH:mm")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#FFD700] font-bold text-lg">
                                        {formatCurrency(trip.final_price || trip.estimated_price)}
                                    </p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                                        ${trip.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {trip.status === 'completed' ? 'Completado' : 'Cancelado'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-gray-800" />

                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full bg-white border-4 border-[#1A1A1A] shrink-0 shadow-sm" />
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-0.5">Recogida</p>
                                        <p className="text-sm font-medium text-white line-clamp-1">{trip.pickup_address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full bg-[#FFD700] border-4 border-[#1A1A1A] shrink-0 shadow-sm" />
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-0.5">Destino</p>
                                        <p className="text-sm font-medium text-white line-clamp-1">{trip.dropoff_address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
