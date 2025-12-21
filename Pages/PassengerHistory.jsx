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
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00D4B1] selection:text-black font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#00D4B1]/5 to-transparent blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-[#ffffff]/5">
                <div className="flex items-center gap-4 px-4 py-3 max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Mis Viajes
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                {/* Filters */}
                <div className="px-4 py-6 sticky top-[60px] z-30 bg-[#050505]/95 backdrop-blur-xl">
                    <Tabs value={filter} onValueChange={setFilter} className="w-full">
                        <TabsList className="bg-[#1A1A2E]/50 p-1 w-full border border-white/5 rounded-full">
                            {['all', 'completed', 'cancelled'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="
                                        flex-1 rounded-full text-xs font-medium py-2 transition-all duration-300
                                        data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black 
                                        data-[state=active]:shadow-[0_0_20px_rgba(0,212,177,0.3)]
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
                            <div className="w-24 h-24 bg-gradient-to-tr from-[#1A1A2E] to-[#252538] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 relative group">
                                <div className="absolute inset-0 bg-[#00D4B1] opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-500" />
                                <MapPin size={40} className="text-gray-500 group-hover:text-[#00D4B1] transition-colors duration-300" />
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
                                        bg-[#00D4B1] text-black font-bold px-8 py-6 rounded-full
                                        shadow-[0_0_30px_rgba(0,212,177,0.3)] hover:shadow-[0_0_50px_rgba(0,212,177,0.5)]
                                        hover:bg-[#00ebd4] hover:scale-105 transition-all duration-300
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
                                            group bg-[#12121A]/80 backdrop-blur-md rounded-2xl border border-white/5 
                                            hover:border-[#00D4B1]/30 hover:bg-[#1A1A2E] transition-all duration-300
                                            overflow-hidden relative animate-in slide-in-from-bottom-4 fade-in
                                        "
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Status Line */}
                                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isCompleted ? 'bg-[#00D4B1]' : 'bg-gray-700'}`} />

                                        <div className="p-5 pl-7">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#252538] flex items-center justify-center text-xl shadow-inner">
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
                                                <div className="absolute left-[5px] top-[8px] bottom-[24px] w-[2px] bg-gradient-to-b from-[#00D4B1] to-[#FF3B30] opacity-30" />

                                                <div className="relative">
                                                    <div className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#00D4B1] bg-[#050505]" />
                                                    <p className="text-sm text-gray-300 font-medium leading-tight">{trip.pickup_address}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-sm border-2 border-[#FF3B30] bg-[#050505]" />
                                                    <p className="text-sm text-gray-300 font-medium leading-tight">{trip.dropoff_address}</p>
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10">
                                                            <User size={12} className="text-gray-400" />
                                                        </div>
                                                        <span className="text-xs text-gray-400">{trip.driver_name || 'Conductor'}</span>
                                                    </div>
                                                    {trip.passenger_rating && (
                                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                            <Star size={10} className="text-yellow-500" fill="currentColor" />
                                                            <span className="text-[10px] font-bold text-yellow-500">{trip.passenger_rating}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-[#00D4B1] tracking-tight">
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
