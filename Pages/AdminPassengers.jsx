import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
    ArrowLeft, Search, Filter, CheckCircle, XCircle,
    User, MoreVertical, Eye, MapPin, TrendingUp, Calendar, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPassengers() {
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState([]);
    const [filteredPassengers, setFilteredPassengers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [passengerTrips, setPassengerTrips] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Derived stats for selected passenger
    const [passengerStats, setPassengerStats] = useState({
        totalSpent: 0,
        avgRideCost: 0,
        canceledTrips: 0,
        completedTrips: 0
    });

    useEffect(() => {
        loadPassengers();
    }, []);

    useEffect(() => {
        filterPassengers();
    }, [passengers, search]);

    useEffect(() => {
        if (selectedPassenger) {
            loadPassengerDetails(selectedPassenger.id);
        }
    }, [selectedPassenger]);

    const loadPassengers = async () => {
        try {
            const data = await goApp.entities.Passenger.list();
            setPassengers(data);
        } catch (error) {
            console.error('Error loading passengers:', error);
        }
    };

    const loadPassengerDetails = async (id) => {
        setIsLoadingDetails(true);
        try {
            const trips = await goApp.entities.Trip.listByPassenger(id);
            setPassengerTrips(trips);

            // Calculate stats
            const completed = trips.filter(t => t.status === 'completed');
            const canceled = trips.filter(t => t.status === 'cancelled');
            const totalSpent = completed.reduce((sum, t) => sum + (t.final_price || t.estimated_price || 0), 0);

            setPassengerStats({
                totalSpent,
                avgRideCost: completed.length > 0 ? totalSpent / completed.length : 0,
                canceledTrips: canceled.length,
                completedTrips: completed.length
            });

        } catch (error) {
            console.error("Error loading details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const filterPassengers = () => {
        let result = [...passengers];

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(p =>
                p.full_name?.toLowerCase().includes(searchLower) ||
                p.phone?.includes(search) ||
                p.email?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredPassengers(result);
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            {/* Header */}


            <main className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">Total Pasajeros</p>
                            <p className="text-2xl font-bold text-white">{passengers.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">Viajes Totales</p>
                            <p className="text-2xl font-bold text-[#00D4B1]">
                                {passengers.reduce((acc, p) => acc + (p.total_trips || 0), 0)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, teléfono o email..."
                            className="pl-10 bg-[#1A1A2E] border-[#2D2D44] text-white"
                        />
                    </div>
                </div>

                {/* Passengers Table */}
                <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2D2D44]">
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Pasajero</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Contacto</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Rating</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Viajes Realizados</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPassengers.map((passenger) => (
                                        <tr key={passenger.id} className="border-b border-[#2D2D44] hover:bg-[#252538] cursor-pointer" onClick={() => setSelectedPassenger(passenger)}>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#252538] rounded-full flex items-center justify-center text-lg">
                                                        <User size={20} className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium hover:text-[#00D4B1] transition-colors">
                                                            {passenger.full_name || 'Sin nombre'}
                                                        </p>
                                                        <p className="text-gray-400 text-sm text-[#00D4B1] font-mono">ID: {passenger.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-white">{passenger.phone}</p>
                                                <p className="text-gray-400 text-sm">{passenger.email}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <span className="text-white">{passenger.rating?.toFixed(1) || '5.0'} ★</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge className="bg-[#00D4B1]/20 text-[#00D4B1] hover:bg-[#00D4B1]/30">
                                                    {passenger.total_trips || 0} Viajes
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedPassenger(passenger); }}>
                                                    <Eye size={18} className="text-gray-400 hover:text-white" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredPassengers.length === 0 && (
                                <div className="text-center py-12">
                                    <User size={48} className="mx-auto text-gray-500 mb-4" />
                                    <p className="text-gray-400">No se encontraron pasajeros</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Detailed Passenger Modal */}
            <Dialog open={!!selectedPassenger} onOpenChange={() => setSelectedPassenger(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Perfil Completo del Pasajero</DialogTitle>
                    </DialogHeader>

                    {selectedPassenger && (
                        <div className="space-y-8">
                            {/* Header Profile */}
                            <div className="flex items-center gap-6 pb-6 border-b border-[#2D2D44]">
                                <div className="w-24 h-24 bg-[#252538] rounded-full flex items-center justify-center border-4 border-[#0F0F1A] shadow-xl">
                                    <User size={48} className="text-[#00D4B1]" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-1">{selectedPassenger.full_name}</h2>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                                        <span>{selectedPassenger.email}</span>
                                        <span>•</span>
                                        <span>{selectedPassenger.phone}</span>
                                        <span>•</span>
                                        <span>Miembro desde {selectedPassenger.created_at ? format(new Date(selectedPassenger.created_at), 'MMM yyyy') : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40 px-3 py-1">
                                            {selectedPassenger.rating?.toFixed(1) || '5.0'} ★ Rating
                                        </Badge>
                                        <Badge variant="outline" className="border-gray-700 text-gray-400">
                                            Usuario Verificado
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#0F0F1A] p-4 rounded-xl border border-[#2D2D44]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-[#00D4B1]/10 rounded-lg text-[#00D4B1]">
                                            <TrendingUp size={20} />
                                        </div>
                                        <span className="text-gray-400 text-sm">Total Gastado</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">Gs. {passengerStats.totalSpent.toLocaleString('es-PY')}</p>
                                </div>
                                <div className="bg-[#0F0F1A] p-4 rounded-xl border border-[#2D2D44]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                            <Calendar size={20} />
                                        </div>
                                        <span className="text-gray-400 text-sm">Viajes Totales</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{passengerStats.completedTrips}</p>
                                </div>
                                <div className="bg-[#0F0F1A] p-4 rounded-xl border border-[#2D2D44]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="text-gray-400 text-sm">Promedio / Viaje</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">Gs. {Math.round(passengerStats.avgRideCost).toLocaleString('es-PY')}</p>
                                </div>
                                <div className="bg-[#0F0F1A] p-4 rounded-xl border border-[#2D2D44]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                            <XCircle size={20} />
                                        </div>
                                        <span className="text-gray-400 text-sm">Cancelados</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">{passengerStats.canceledTrips}</p>
                                </div>
                            </div>

                            {/* Trip History */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Calendar size={20} className="text-[#00D4B1]" />
                                    Historial de Viajes Recientes
                                </h3>

                                {isLoadingDetails ? (
                                    <div className="text-center py-8 text-gray-500">Cargando historial...</div>
                                ) : (
                                    <div className="space-y-3">
                                        {passengerTrips.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">Este pasajero aún no ha realizado viajes.</p>
                                        ) : (
                                            passengerTrips.slice(0, 10).map((trip) => (
                                                <div key={trip.id} className="bg-[#252538] rounded-xl p-4 flex items-center justify-between hover:bg-[#2D2D44] transition-colors border border-transparent hover:border-[#00D4B1]/30">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#0F0F1A] flex items-center justify-center text-gray-400">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-white">
                                                                    {trip.completed_at ? format(new Date(trip.completed_at), "d MMMM, HH:mm", { locale: es }) : 'Fecha desconocida'}
                                                                </span>
                                                                <Badge variant="outline" className={`text-xs ${trip.status === 'completed' ? 'border-[#00D4B1] text-[#00D4B1]' :
                                                                    trip.status === 'cancelled' ? 'border-red-500 text-red-500' :
                                                                        'border-yellow-500 text-yellow-500'
                                                                    }`}>
                                                                    {trip.status === 'completed' ? 'Completado' : trip.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-gray-400 flex items-center gap-1">
                                                                {trip.pickup_address?.split(',')[0]}
                                                                <ArrowLeft size={12} className="rotate-180" />
                                                                {trip.dropoff_address?.split(',')[0]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-[#00D4B1]">Gs. {(trip.final_price || trip.estimated_price || 0).toLocaleString('es-PY')}</p>
                                                        <p className="text-xs text-gray-500">Conductor: {trip.driver?.first_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {passengerTrips.length > 10 && (
                                            <Button variant="ghost" className="w-full text-[#00D4B1] text-sm mt-2">
                                                Ver historial completo ({passengerTrips.length} viajes)
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
