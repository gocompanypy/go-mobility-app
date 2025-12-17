import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, Star, Receipt, ChevronRight } from 'lucide-react';
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
            const user = await base44.auth.me();
            const data = await base44.entities.Trip.filter(
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
                                    className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] overflow-hidden"
                                >
                                    {/* Trip Header */}
                                    <div className="p-4 border-b border-[#2D2D44]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{vehicleConfig.icon}</span>
                                                <span className="font-medium">{vehicleConfig.name}</span>
                                            </div>
                                            {getStatusBadge(trip.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar size={14} />
                                            {format(new Date(trip.created_date), "d 'de' MMMM, HH:mm", { locale: es })}
                                        </div>
                                    </div>

                                    {/* Trip Route */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5">
                                                <div className="w-2 h-2 bg-[#00D4B1] rounded-full" />
                                            </div>
                                            <p className="text-sm text-gray-300 flex-1">{trip.pickup_address}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5">
                                                <div className="w-2 h-2 bg-[#FF6B6B] rounded-full" />
                                            </div>
                                            <p className="text-sm text-gray-300 flex-1">{trip.dropoff_address}</p>
                                        </div>
                                    </div>

                                    {/* Trip Footer */}
                                    <div className="px-4 py-3 bg-[#252538] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold">
                                                Gs. {(trip.final_price || trip.estimated_price)?.toLocaleString('es-PY')}
                                            </span>
                                            {trip.passenger_rating && (
                                                <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                                    <Star size={14} fill="currentColor" />
                                                    {trip.passenger_rating}
                                                </span>
                                            )}
                                        </div>
                                        {trip.status === 'completed' && (
                                            <Button variant="ghost" size="sm" className="text-[#00D4B1]">
                                                <Receipt size={16} className="mr-1" />
                                                Factura
                                            </Button>
                                        )}
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
