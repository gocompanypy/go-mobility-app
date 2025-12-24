import React, { useState, useEffect } from 'react';
import { goApp, supabase } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, formatCurrency } from '@/lib/utils';
import {
    ArrowLeft, Search, Filter, CheckCircle, XCircle,
    Clock, Star, Car, MoreVertical, Eye, FileText,
    AlertTriangle, MessageCircle, Ban, Bell, Shield, Wallet
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
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Logo from '@/components/go/Logo';
import { theme } from '@/components/go/theme';
import DocumentVerifier from '@/components/admin/DocumentVerifier';

const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: '#FFB800', icon: Clock },
    approved: { label: 'Aprobado', color: '#00D4B1', icon: CheckCircle },
    suspended: { label: 'Suspendido', color: '#F59E0B', icon: AlertTriangle },
    blocked: { label: 'Bloqueado', color: '#EF4444', icon: Ban },
};

const FILTER_CHIPS = [
    { id: 'all', label: 'Todos' },
    { id: 'docs_expired', label: 'Documentos Vencidos', icon: FileText, color: 'text-red-400' },
    { id: 'debtors', label: 'Deudores (>50k)', icon: Wallet, color: 'text-yellow-400' },
    { id: 'top_rated', label: 'Top Rated (4.9+)', icon: Star, color: 'text-[#00D4B1]' },
    { id: 'inactive', label: 'Inactivos +7 días', icon: Clock, color: 'text-gray-400' },
];

export default function AdminDrivers() {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // Chip filter
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Document Verifier State
    const [isVerifierOpen, setIsVerifierOpen] = useState(false);
    const [driverToVerify, setDriverToVerify] = useState(null);

    useEffect(() => {
        loadDrivers();

        // Realtime Subscription
        const channel = supabase
            .channel('drivers-list-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'drivers'
                },
                (payload) => {
                    console.log('Driver change detected:', payload);
                    loadDrivers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        filterDrivers();
    }, [drivers, search, activeFilter]);

    const loadDrivers = async () => {
        try {
            const data = await goApp.entities.Driver.list('-created_date');
            setDrivers(data || []);
            setError(null);
        } catch (error) {
            console.error('Error loading drivers:', error);
            setError(error.message);
        }
        setIsLoading(false);
    };

    const filterDrivers = () => {
        let result = [...drivers];

        // Global Search (Name, Phone, Plate, ID)
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(d =>
                d.first_name?.toLowerCase().includes(searchLower) ||
                d.last_name?.toLowerCase().includes(searchLower) ||
                d.phone?.includes(search) ||
                d.vehicle_plate?.toLowerCase().includes(searchLower) ||
                d.id?.toLowerCase().includes(searchLower)
            );
        }

        // Chip Filters
        switch (activeFilter) {
            case 'docs_expired':
                result = result.filter(d =>
                    d.documents_status?.license === 'expired' ||
                    d.documents_status?.insurance === 'expired'
                );
                break;
            case 'debtors':
                result = result.filter(d => d.wallet_balance < -50000);
                break;
            case 'top_rated':
                result = result.filter(d => d.rating >= 4.9);
                break;
            case 'inactive':
                // Mock logic for inactivity
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                // Ensure last_active_at exists or defaults 
                const lastActive = d.last_active_at ? new Date(d.last_active_at) : new Date(0);
                result = result.filter(d => lastActive < sevenDaysAgo);
                break;
            default:
                break;
        }

        setFilteredDrivers(result);
    };

    const updateDriverStatus = async (driverId, newStatus, reason = null) => {
        try {
            await goApp.entities.Driver.update(driverId, {
                status: newStatus,
                status_reason: reason
            });

            setDrivers(drivers.map(d =>
                d.id === driverId ? { ...d, status: newStatus } : d
            ));

            if (reason) {
                console.log(`Driver ${driverId} status updated to ${newStatus}. Reason: ${reason}`);
            }

            setSelectedDriver(null);
            setIsVerifierOpen(false);
        } catch (error) {
            console.error('Error updating driver:', error);
            alert("Error al actualizar estado: " + error.message);
        }
    };

    const openVerifier = (driver) => {
        setDriverToVerify(driver);
        setIsVerifierOpen(true);
    };

    const handleWhatsApp = (phone) => {
        const cleanPhone = phone?.replace(/\D/g, '') || '';
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[#0F0F1A] text-white font-sans">
                <main className="p-6 max-w-[1600px] mx-auto">

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-4">
                            <XCircle size={24} />
                            <div>
                                <p className="font-bold">Error al cargar conductores</p>
                                <p className="text-sm opacity-80">{error}</p>
                                {error.includes('does not exist') && (
                                    <p className="text-xs mt-1 text-white/50">Probablemente falta la tabla 'drivers' en Supabase.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Flota', value: drivers.length, color: 'text-white' },
                            { label: 'Atención Requerida', value: drivers.filter(d => d.status === 'pending').length, color: 'text-[#FFB800]' },
                            { label: 'Activos Hoy', value: drivers.filter(d => d.is_online).length, color: 'text-[#00D4B1]' },
                            { label: 'Deuda Total', value: formatCurrency(drivers.reduce((acc, d) => acc + (d.wallet_balance < 0 ? d.wallet_balance : 0), 0)), color: 'text-red-400' },
                        ].map((stat, i) => (
                            <Card key={i} className="bg-[#1A1A2E] border-[#2D2D44] hover:border-[#3D3D54] transition-colors">
                                <CardContent className="p-5">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Controls & Filters */}
                    <div className="flex flex-col gap-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                            {/* Search */}
                            <div className="relative w-full md:w-96 group">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-[#FFD700] transition-colors" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre, placa, ID..."
                                    className="pl-10 bg-[#1A1A2E] border-[#2D2D44] text-white focus:border-[#FFD700]/50 h-12 rounded-xl"
                                />
                            </div>

                            {/* Primary Action */}
                            <Button className="bg-[#FFD700] hover:bg-[#FFA500] text-black font-bold rounded-xl h-12 px-6 shadow-lg shadow-[#FFD700]/10" onClick={() => navigate('/driver/register')}>
                                + Nuevo Conductor
                            </Button>
                        </div>

                        {/* Quick Filters (Chips) */}
                        <div className="flex flex-wrap gap-2">
                            {FILTER_CHIPS.map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setActiveFilter(chip.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                        ${activeFilter === chip.id
                                            ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                                            : 'bg-[#1A1A2E] border-[#2D2D44] text-gray-400 hover:border-gray-600 hover:text-white'}
                                    `}
                                >
                                    {chip.icon && <chip.icon size={14} className={activeFilter === chip.id ? 'text-[#FFD700]' : chip.color} />}
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Table */}
                    <Card className="bg-[#1A1A2E] border-[#2D2D44] overflow-hidden rounded-xl shadow-2xl">
                        <div className="overflow-x-auto resize-y overflow-hidden" style={{ minHeight: '400px', resize: 'vertical' }}>
                            <table className="w-full">
                                <thead className="bg-[#151525] border-b border-[#2D2D44]">
                                    <tr>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Conductor</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Vehículo</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Docs</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Finanzas</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Métricas</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Última act.</th>
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2D2D44]">
                                    {filteredDrivers.map((driver) => {
                                        const statusConfig = STATUS_CONFIG[driver.status] || STATUS_CONFIG.pending;

                                        return (
                                            <tr key={driver.id} className="hover:bg-[#202030] transition-colors group">
                                                {/* Conductor Identity */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2D2D44]">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random&color=fff`}
                                                                alt={driver.first_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-sm">{driver.first_name} {driver.last_name}</p>
                                                            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                                                {driver.phone}
                                                                <span className={`w-2 h-2 rounded-full ${driver.is_online ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Vehicle Info */}
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <p className="text-gray-200 text-sm font-medium">{driver.vehicle_make} {driver.vehicle_model}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="border-[#2D2D44] text-xs text-gray-400 font-mono bg-black/20">
                                                                {driver.vehicle_plate}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">{driver.vehicle_color} • {driver.vehicle_year}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Documents Status */}
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {driver.documents_status?.license === 'valid'
                                                                    ? <Shield size={18} className="text-green-500" />
                                                                    : <AlertTriangle size={18} className="text-red-500" />}
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Licencia</p></TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {driver.documents_status?.insurance === 'valid'
                                                                    ? <FileText size={18} className="text-green-500" />
                                                                    : <AlertTriangle size={18} className="text-red-500" />}
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Seguro</p></TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>

                                                {/* Finanzas */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`text-sm font-bold ${driver.wallet_balance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                            {formatCurrency(driver.wallet_balance || 0)}
                                                        </span>
                                                        {driver.wallet_balance < -50000 && (
                                                            <Button size="xs" variant="outline" className="h-6 text-[10px] border-red-500/30 text-red-500 hover:bg-red-500/10">
                                                                Reclamar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Métricas */}
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <div className="flex items-center text-yellow-500 font-bold">
                                                                {driver.rating?.toFixed(1) || '5.0'} <Star size={10} fill="currentColor" className="ml-0.5" />
                                                            </div>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="text-gray-300">{driver.total_trips || 0} Viajes</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{driver.acceptance_rate || 95}% Acept.</span>
                                                            <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{driver.cancellation_rate || 2}% Canc.</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Last Active */}
                                                <td className="py-4 px-6">
                                                    <div className="text-xs text-gray-400">
                                                        {driver.last_active_at
                                                            ? formatDistanceToNow(new Date(driver.last_active_at), { addSuffix: true, locale: es })
                                                            : 'Nunca'}
                                                    </div>
                                                    <div className="mt-1">
                                                        <Badge variant="outline" className={`
                                                        border-0 text-[10px] font-bold px-2 py-0.5
                                                        ${driver.status === 'approved' ? 'bg-[#00D4B1]/10 text-[#00D4B1]' :
                                                                driver.status === 'pending' ? 'bg-[#FFB800]/10 text-[#FFB800]' : 'bg-red-500/10 text-red-500'}
                                                    `}>
                                                            {STATUS_CONFIG[driver.status]?.label || driver.status}
                                                        </Badge>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#2D2D44]">
                                                                <MoreVertical size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="bg-[#1A1A2E] border-[#2D2D44] text-white w-56" align="end">
                                                            <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Gestión</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setSelectedDriver(driver)} className="cursor-pointer hover:bg-[#252538] focus:bg-[#252538]">
                                                                <Eye size={16} className="mr-2" /> Ver Perfil Completo
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openVerifier(driver)} className="cursor-pointer hover:bg-[#252538] focus:bg-[#252538]">
                                                                <FileText size={16} className="mr-2" /> Revisar Documentos
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2D2D44]" />
                                                            <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Comunicación</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleWhatsApp(driver.phone)} className="cursor-pointer hover:bg-[#252538] focus:bg-[#252538] text-green-400">
                                                                <MessageCircle size={16} className="mr-2" /> WhatsApp
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer hover:bg-[#252538] focus:bg-[#252538]">
                                                                <Bell size={16} className="mr-2" /> Enviar Push
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-[#2D2D44]" />
                                                            {driver.status !== 'blocked' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => updateDriverStatus(driver.id, 'blocked')}
                                                                    className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-500"
                                                                >
                                                                    <Ban size={16} className="mr-2" /> Bloquear Cuenta
                                                                </DropdownMenuItem>
                                                            )}
                                                            {driver.status === 'blocked' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => updateDriverStatus(driver.id, 'approved')}
                                                                    className="cursor-pointer hover:bg-green-500/20 focus:bg-green-500/20 text-green-500"
                                                                >
                                                                    <CheckCircle size={16} className="mr-2" /> Desbloquear
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredDrivers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Car size={48} className="mb-4 opacity-20" />
                                                    <p className="text-lg font-medium">No se encontraron conductores</p>
                                                    <p className="text-sm opacity-60">Intenta cambiar los filtros de búsqueda</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </main>

                {/* Document Verifier Modal */}
                <DocumentVerifier
                    driver={driverToVerify}
                    isOpen={isVerifierOpen}
                    onClose={() => setIsVerifierOpen(false)}
                    onApprove={(id) => updateDriverStatus(id, 'approved')}
                    onReject={(id, reason) => updateDriverStatus(id, 'blocked', reason)}
                />

                {/* Driver Detail Modal (Simplified for specific view request) */}
                <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
                    <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                {selectedDriver && (
                                    <>
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${selectedDriver.first_name}+${selectedDriver.last_name}&background=random&color=fff`}
                                                className="w-full h-full"
                                                alt={selectedDriver.first_name}
                                            />
                                        </div>
                                        <div>
                                            <p>{selectedDriver.first_name} {selectedDriver.last_name}</p>
                                            <p className="text-xs text-gray-400 font-normal">ID: {selectedDriver.id}</p>
                                        </div>
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedDriver && (
                            <div className="grid grid-cols-2 gap-6 py-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehículo</h4>
                                    <p className="text-lg">{selectedDriver.vehicle_make} {selectedDriver.vehicle_model}</p>
                                    <p className="text-sm text-gray-400">{selectedDriver.vehicle_year} • {selectedDriver.vehicle_color}</p>
                                    <Badge variant="outline" className="mt-2 border-[#FFD700]/30 text-[#FFD700]">{selectedDriver.vehicle_plate}</Badge>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contacto</h4>
                                    <p className="text-lg">{selectedDriver.phone}</p>
                                    <p className="text-sm text-gray-400">{selectedDriver.email}</p>
                                    <Button size="sm" variant="outline" className="mt-2 text-green-400 border-green-400/20 hover:bg-green-400/10" onClick={() => handleWhatsApp(selectedDriver.phone)}>
                                        <MessageCircle size={14} className="mr-1" /> WhatsApp
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
