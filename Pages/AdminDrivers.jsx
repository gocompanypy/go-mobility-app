import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
    ArrowLeft, Search, Filter, CheckCircle, XCircle,
    Clock, Star, Car, MoreVertical, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import Logo from '@/components/go/Logo';
import { theme } from '@/components/go/theme';

const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: '#FFB800', icon: Clock },
    approved: { label: 'Aprobado', color: '#00D4B1', icon: CheckCircle },
    suspended: { label: 'Suspendido', color: '#F59E0B', icon: XCircle },
    blocked: { label: 'Bloqueado', color: '#EF4444', icon: XCircle },
};

export default function AdminDrivers() {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        filterDrivers();
    }, [drivers, search, statusFilter]);

    const loadDrivers = async () => {
        try {
            const data = await base44.entities.Driver.list('-created_date');
            setDrivers(data);
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
        setIsLoading(false);
    };

    const filterDrivers = () => {
        let result = [...drivers];

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(d =>
                d.first_name?.toLowerCase().includes(searchLower) ||
                d.last_name?.toLowerCase().includes(searchLower) ||
                d.phone?.includes(search) ||
                d.vehicle_plate?.toLowerCase().includes(searchLower)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(d => d.status === statusFilter);
        }

        setFilteredDrivers(result);
    };

    const updateDriverStatus = async (driverId, newStatus) => {
        try {
            await base44.entities.Driver.update(driverId, { status: newStatus });
            setDrivers(drivers.map(d =>
                d.id === driverId ? { ...d, status: newStatus } : d
            ));
            setSelectedDriver(null);
        } catch (error) {
            console.error('Error updating driver:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            {/* Header */}
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
                    <h1 className="text-xl font-bold">Gestión de Conductores</h1>
                </div>
            </header>

            <main className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">Total</p>
                            <p className="text-2xl font-bold text-white">{drivers.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">Aprobados</p>
                            <p className="text-2xl font-bold text-[#00D4B1]">
                                {drivers.filter(d => d.status === 'approved').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">Pendientes</p>
                            <p className="text-2xl font-bold text-[#FFB800]">
                                {drivers.filter(d => d.status === 'pending').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-sm">En línea</p>
                            <p className="text-2xl font-bold text-[#3B82F6]">
                                {drivers.filter(d => d.is_online).length}
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
                            placeholder="Buscar por nombre, teléfono o matrícula..."
                            className="pl-10 bg-[#1A1A2E] border-[#2D2D44] text-white"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-[#1A1A2E] border-[#2D2D44] text-white">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A2E] border-[#2D2D44]">
                            <SelectItem value="all" className="text-white">Todos los estados</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-white">
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Drivers Table */}
                <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#2D2D44]">
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Conductor</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Vehículo</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Rating</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Viajes</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Online</th>
                                        <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDrivers.map((driver) => {
                                        const statusConfig = STATUS_CONFIG[driver.status] || STATUS_CONFIG.pending;
                                        const vehicleConfig = theme.vehicleTypes[driver.vehicle_type] || {};

                                        return (
                                            <tr key={driver.id} className="border-b border-[#2D2D44] hover:bg-[#252538]">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#252538] rounded-full flex items-center justify-center text-lg">
                                                            {vehicleConfig.icon || '🚗'}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {driver.first_name} {driver.last_name}
                                                            </p>
                                                            <p className="text-gray-400 text-sm">{driver.phone}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-white">{driver.vehicle_make} {driver.vehicle_model}</p>
                                                    <p className="text-[#00D4B1] text-sm font-mono">{driver.vehicle_plate}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge
                                                        style={{
                                                            backgroundColor: `${statusConfig.color}20`,
                                                            color: statusConfig.color
                                                        }}
                                                    >
                                                        {statusConfig.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Star size={14} fill="currentColor" />
                                                        <span className="text-white">{driver.rating?.toFixed(1) || '5.0'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-white">{driver.total_trips || 0}</td>
                                                <td className="py-4 px-6">
                                                    <div className={`w-3 h-3 rounded-full ${driver.is_online ? 'bg-green-400' : 'bg-gray-500'}`} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="bg-[#1A1A2E] border-[#2D2D44]">
                                                            <DropdownMenuItem
                                                                className="text-white"
                                                                onClick={() => setSelectedDriver(driver)}
                                                            >
                                                                <Eye size={16} className="mr-2" />
                                                                Ver detalles
                                                            </DropdownMenuItem>
                                                            {driver.status === 'pending' && (
                                                                <DropdownMenuItem
                                                                    className="text-[#00D4B1]"
                                                                    onClick={() => updateDriverStatus(driver.id, 'approved')}
                                                                >
                                                                    <CheckCircle size={16} className="mr-2" />
                                                                    Aprobar
                                                                </DropdownMenuItem>
                                                            )}
                                                            {driver.status === 'approved' && (
                                                                <DropdownMenuItem
                                                                    className="text-[#F59E0B]"
                                                                    onClick={() => updateDriverStatus(driver.id, 'suspended')}
                                                                >
                                                                    <XCircle size={16} className="mr-2" />
                                                                    Suspender
                                                                </DropdownMenuItem>
                                                            )}
                                                            {driver.status === 'suspended' && (
                                                                <DropdownMenuItem
                                                                    className="text-[#00D4B1]"
                                                                    onClick={() => updateDriverStatus(driver.id, 'approved')}
                                                                >
                                                                    <CheckCircle size={16} className="mr-2" />
                                                                    Reactivar
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredDrivers.length === 0 && (
                                <div className="text-center py-12">
                                    <Car size={48} className="mx-auto text-gray-500 mb-4" />
                                    <p className="text-gray-400">No se encontraron conductores</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Driver Detail Modal */}
            <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles del Conductor</DialogTitle>
                    </DialogHeader>

                    {selectedDriver && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Nombre completo</p>
                                    <p className="text-white font-medium">
                                        {selectedDriver.first_name} {selectedDriver.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Teléfono</p>
                                    <p className="text-white">{selectedDriver.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Vehículo</p>
                                    <p className="text-white">
                                        {selectedDriver.vehicle_make} {selectedDriver.vehicle_model} ({selectedDriver.vehicle_year})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Matrícula</p>
                                    <p className="text-[#00D4B1] font-mono">{selectedDriver.vehicle_plate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Licencia</p>
                                    <p className="text-white">{selectedDriver.license_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Fecha de registro</p>
                                    <p className="text-white">
                                        {format(new Date(selectedDriver.created_date), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-[#252538] rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-white">{selectedDriver.total_trips || 0}</p>
                                    <p className="text-gray-400 text-sm">Viajes</p>
                                </div>
                                <div className="bg-[#252538] rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-[#00D4B1]">
                                        €{(selectedDriver.total_earnings || 0).toFixed(2)}
                                    </p>
                                    <p className="text-gray-400 text-sm">Ganancias</p>
                                </div>
                                <div className="bg-[#252538] rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {selectedDriver.rating?.toFixed(1) || '5.0'}
                                    </p>
                                    <p className="text-gray-400 text-sm">Rating</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {selectedDriver.status === 'pending' && (
                                    <Button
                                        className="flex-1 bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                                        onClick={() => updateDriverStatus(selectedDriver.id, 'approved')}
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Aprobar conductor
                                    </Button>
                                )}
                                {selectedDriver.status === 'approved' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                                        onClick={() => updateDriverStatus(selectedDriver.id, 'suspended')}
                                    >
                                        <XCircle size={18} className="mr-2" />
                                        Suspender
                                    </Button>
                                )}
                                {selectedDriver.status === 'suspended' && (
                                    <Button
                                        className="flex-1 bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                                        onClick={() => updateDriverStatus(selectedDriver.id, 'approved')}
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Reactivar
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
