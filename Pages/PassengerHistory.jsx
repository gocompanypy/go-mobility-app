import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, Star, Receipt, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Logo from '@/components/go/Logo';
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
            <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b-2 border-[#FFD700]/20 gold-glow" style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.15)' }}>
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-white"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-xl font-bold">Mis viajes</h1>
                </div>
            </header>

            {/* Filters */}
            <div className="px-4 py-4">
                <Tabs value={filter} onValueChange={setFilter}>
                    <TabsList className="bg-[#1A1A2E] w-full">
                        <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black">
                            Todos
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black">
                            Completados
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex-1 data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black">
                            Cancelados
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Trip List */}
            <div className="px-4 pb-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#1A1A2E] rounded-xl p-4 animate-pulse">
                                <div className="h-4 bg-[#252538] rounded w-1/3 mb-3" />
                                <div className="h-3 bg-[#252538] rounded w-2/3 mb-2" />
                                <div className="h-3 bg-[#252538] rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#1A1A2E] rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Sin viajes</h3>
                        <p className="text-gray-400">
                            {filter === 'all'
                                ? 'Aún no has realizado ningún viaje'
                                : `No tienes viajes ${filter === 'completed' ? 'completados' : 'cancelados'}`
                            }
                        </p>
                        <Button
                            onClick={() => navigate(createPageUrl('PassengerHome'))}
                            className="mt-4 bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                        >
                            Pedir un viaje
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTrips.map(trip => {
                            const vehicleConfig = theme.vehicleTypes[trip.vehicle_type] || theme.vehicleTypes.economy;

                            return (
                                <div
                                    key={trip.id}
                                    className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] overflow-hidden hover:border-[#FFD700]/30 transition-colors"
                                >
                                    <div className="flex">
                                        {/* Mini Map Thumbnail */}
                                        <div className="w-24 h-full min-h-[120px] bg-[#252538] relative overflow-hidden border-r border-[#2D2D44]">
                                            {/* Stylized Map Background */}
                                            <div className="absolute inset-0 bg-[#111] opacity-60" style={{
                                                backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                                                backgroundSize: '10px 10px'
                                            }} />
                                            {/* Route Line Simulation */}
                                            <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <path d="M20,80 Q50,50 80,20" stroke="#00D4B1" strokeWidth="4" fill="none" strokeDasharray="5,2" />
                                                <circle cx="20" cy="80" r="4" fill="#00D4B1" />
                                                <circle cx="80" cy="20" r="4" fill="#FFD700" />
                                            </svg>
                                        </div>

                                        <div className="flex-1">
                                            {/* Trip Header */}
                                            <div className="p-3 border-b border-[#2D2D44] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-400">
                                                        {format(new Date(trip.created_date), "d MMM, HH:mm", { locale: es })}
                                                    </span>
                                                </div>
                                                {getStatusBadge(trip.status)}
                                            </div>

                                            {/* Trip Route */}
                                            <div className="p-3 space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-1">
                                                        <div className="w-1.5 h-1.5 bg-[#00D4B1] rounded-full" />
                                                    </div>
                                                    <p className="text-xs text-gray-300 line-clamp-1">{trip.pickup_address}</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-1">
                                                        <div className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full" />
                                                    </div>
                                                    <p className="text-xs text-gray-300 line-clamp-1">{trip.dropoff_address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Footer */}
                                    <div className="px-3 py-2 bg-[#252538] flex items-center justify-between border-t border-[#2D2D44]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                {/* Driver Avatar Placeholder */}
                                                <User size={16} className="m-1 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-300">{trip.driver_name || 'Conductor'}</span>
                                                <span className="text-[10px] text-gray-500">{vehicleConfig.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {trip.passenger_rating && (
                                                <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                    {trip.passenger_rating} <Star size={10} fill="currentColor" />
                                                </span>
                                            )}
                                            <span className="text-sm font-bold text-[#FFD700]">
                                                Gs. {(trip.final_price || trip.estimated_price)?.toLocaleString('es-PY')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
