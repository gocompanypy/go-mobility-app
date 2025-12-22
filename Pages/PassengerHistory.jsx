import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, Star, Receipt, ChevronRight, User, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { theme } from '@/components/go/theme';

export default function PassengerHistory() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const user = await goApp.auth.me();
            const data = await goApp.entities.Trip.filter(
                { created_by: user.email },
                '-created_date'
            );
            setTrips(data);
        } catch (error) {
            console.error('Error loading trips:', error);
        }
        setIsLoading(false);
    };

    const filteredTrips = trips.filter(trip => {
        if (filter === 'all') return true;
        if (filter === 'completed') return trip.status === 'completed';
        if (filter === 'cancelled') return trip.status.includes('cancelled');
        return true;
    });

    const getStatusBadge = (status) => {
        const config = theme.tripStatuses[status] || { label: status, color: '#666' };
        return (
            <div className={`
                px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                flex items-center gap-1.5 backdrop-blur-md border
            `}
                style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    borderColor: `${config.color}30`
                }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                {config.label}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#FFD700] selection:text-black font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#FFD700]/10 to-transparent blur-3xl opacity-30" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-[#ffffff]/5">
                <div className="flex items-center gap-4 px-4 py-3 max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-[#FFD700] hover:text-[#FFD700]/80 hover:bg-[#FFD700]/10 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Mis Viajes
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                {/* Filters */}
                <div className="px-4 py-6 sticky top-[60px] z-30 bg-[#050505]/95 backdrop-blur-xl">
                    <Tabs value={filter} onValueChange={setFilter} className="w-full">
                        <TabsList className="bg-zinc-900/80 p-1 w-full border border-white/5 rounded-full">
                            {['all', 'completed', 'cancelled'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="
                                        flex-1 rounded-full text-xs font-medium py-2 transition-all duration-300
                                        data-[state=active]:bg-[#FFD700] data-[state=active]:text-black 
                                        data-[state=active]:font-bold
                                        data-[state=active]:shadow-[0_0_20px_rgba(255,215,0,0.3)]
                                        text-gray-400 hover:text-white
                                    "
                                >
                                    {tab === 'all' ? 'Todos' : tab === 'completed' ? 'Completados' : 'Cancelados'}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Trip List */}
                <div className="px-4 pb-12 space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-[#1A1A2E]/30 rounded-2xl p-5 border border-white/5 animate-pulse">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-4 bg-white/5 rounded w-24" />
                                        <div className="h-6 bg-white/5 rounded-full w-20" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-white/5 rounded w-3/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-gradient-to-tr from-[#1A1A1A] to-[#2A2A2A] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,215,0,0.1)] border border-[#FFD700]/20 relative group">
                                <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-500" />
                                <MapPin size={40} className="text-[#FFD700]/50 group-hover:text-[#FFD700] transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {filter === 'all' ? 'Aún sin viajes' : 'Carpeta vacía'}
                            </h3>
                            <p className="text-gray-400 text-center text-sm max-w-[250px] mb-8 leading-relaxed">
                                {filter === 'all'
                                    ? 'Tu historial aparecerá aquí cuando completes tu primer viaje.'
                                    : `No hay viajes ${filter === 'completed' ? 'completados' : 'cancelados'} para mostrar en este momento.`
                                }
                            </p>

                            {filter === 'all' && (
                                <Button
                                    onClick={() => navigate(createPageUrl('PassengerHome'))}
                                    className="
                                        bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-8 py-6 rounded-full
                                        shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)]
                                        hover:scale-105 transition-all duration-300 border-0
                                    "
                                >
                                    Pedir mi primer viaje
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTrips.map((trip, idx) => {
                                const vehicleConfig = theme.vehicleTypes[trip.vehicle_type] || theme.vehicleTypes.economy;
                                const isCompleted = trip.status === 'completed';

                                return (
                                    <div
                                        key={trip.id}
                                        className="
                                            group bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 
                                            hover:border-[#FFD700]/50 hover:bg-black transition-all duration-300
                                            overflow-hidden relative animate-in slide-in-from-bottom-4 fade-in
                                        "
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Status Line */}
                                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isCompleted ? 'bg-[#FFD700]' : 'bg-gray-800'}`} />

                                        <div className="p-5 pl-7">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner border border-white/5">
                                                        {vehicleConfig.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{vehicleConfig.name}</h4>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {format(new Date(trip.created_date), "d MMM, HH:mm", { locale: es })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(trip.status)}
                                            </div>

                                            {/* Route */}
                                            <div className="relative pl-4 space-y-4 mb-5">
                                                {/* Connecting Line */}
                                                <div className="absolute left-[5px] top-[8px] bottom-[24px] w-[2px] bg-gradient-to-b from-[#FFD700] to-[#FFA500] opacity-30" />

                                                <div className="relative">
                                                    <div className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#FFD700] bg-black" />
                                                    <p className="text-sm text-gray-300 font-medium leading-tight">{trip.pickup_address}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-sm border-2 border-[#FFA500] bg-black" />
                                                    <p className="text-sm text-gray-300 font-medium leading-tight">{trip.dropoff_address}</p>
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-white/10">
                                                            <User size={12} className="text-gray-400" />
                                                        </div>
                                                        <span className="text-xs text-gray-400">{trip.driver_name || 'Conductor'}</span>
                                                    </div>
                                                    {trip.passenger_rating && (
                                                        <div className="flex items-center gap-1 bg-[#FFD700]/10 px-2 py-0.5 rounded-full border border-[#FFD700]/20">
                                                            <Star size={10} className="text-[#FFD700]" fill="currentColor" />
                                                            <span className="text-[10px] font-bold text-[#FFD700]">{trip.passenger_rating}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-[#FFD700] tracking-tight">
                                                        Gs. {(trip.final_price || trip.estimated_price)?.toLocaleString('es-PY')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
