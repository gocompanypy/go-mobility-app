import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Search, Filter, Shield, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { theme } from '@/components/go/theme';

export default function AdminTrips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadTrips();
    }, []);

    useEffect(() => {
        filterTrips();
    }, [trips, statusFilter, search]);

    const loadTrips = async () => {
        try {
            const data = await goApp.entities.Trip.list('-created_date');
            setTrips(data);
        } catch (error) {
            console.error('Error loading trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTrips = () => {
        let result = [...trips];

        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(t =>
                t.passenger_name?.toLowerCase().includes(searchLower) ||
                t.driver_name?.toLowerCase().includes(searchLower) ||
                t.id.includes(search)
            );
        }

        setFilteredTrips(result);
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-lg border-b border-[#2D2D44]">
                <div className="flex items-center gap-4 px-6 py-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('AdminDashboard'))}
                        className="text-white"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-xl font-bold">Gestión de Viajes</h1>
                </div>
            </header>

            <main className="p-6">
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Buscar por ID, pasajero o conductor..."
                            className="pl-10 bg-[#1A1A2E] border-[#2D2D44] text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48 bg-[#1A1A2E] border-[#2D2D44] text-white">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A2E] border-[#2D2D44]">
                            <SelectItem value="all" className="text-white">Todos</SelectItem>
                            {Object.entries(theme.tripStatuses).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-white">
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2D2D44]">
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">ID</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Fecha</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Pasajero</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Conductor</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Ruta</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-gray-400">Cargando viajes...</td>
                                        </tr>
                                    ) : filteredTrips.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-gray-400">No se encontraron viajes</td>
                                        </tr>
                                    ) : filteredTrips.map((trip) => {
                                        const statusConfig = theme.tripStatuses[trip.status] || {};
                                        return (
                                            <tr key={trip.id} className="border-b border-[#2D2D44] hover:bg-[#252538]">
                                                <td className="py-4 px-6 font-mono text-sm text-gray-400">
                                                    {trip.id.slice(0, 8)}...
                                                </td>
                                                <td className="py-4 px-6 text-white text-sm">
                                                    {format(new Date(trip.created_date), 'dd/MM/yyyy HH:mm')}
                                                </td>
                                                <td className="py-4 px-6 text-white">{trip.passenger_name}</td>
                                                <td className="py-4 px-6 text-white">{trip.driver_name || '-'}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                            <span className="truncate max-w-[150px]">{trip.pickup_address}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                                            <span className="truncate max-w-[150px]">{trip.dropoff_address}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge
                                                        className="capitalize"
                                                        style={{
                                                            backgroundColor: `${statusConfig.color}20`,
                                                            color: statusConfig.color
                                                        }}
                                                    >
                                                        {statusConfig.label || trip.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-[#00D4B1] font-bold">
                                                    Gs. {(trip.final_price || trip.estimated_price || 0).toLocaleString('es-PY')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
