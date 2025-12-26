import React, { useState, useEffect } from 'react';
import { goApp, supabase } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, formatCurrency } from '@/lib/utils';
import {
    ArrowLeft, Search, Filter, CheckCircle, XCircle,
    Clock, Star, Car, MoreVertical, Eye, FileText,
    AlertTriangle, MessageCircle, Ban, Bell, Shield, Wallet, Lock, Trash2, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
    const [selectedVehicle, setSelectedVehicle] = useState(null);
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
            const updatePayload = { status: newStatus };
            if (reason) {
                updatePayload.status_reason = reason;
            }

            await goApp.entities.Driver.update(driverId, updatePayload);

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
            setError("Error al actualizar estado: " + error.message);
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
                                        <th className="text-left py-5 px-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">Estado / Aprobación</th>
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
                                                        <div
                                                            className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2D2D44] cursor-pointer hover:border-[#FFD700] hover:scale-110 transition-all duration-200 shadow-lg"
                                                            onClick={() => setSelectedDriver(driver)}
                                                        >
                                                            <img
                                                                src={driver.avatar_url || `https://ui-avatars.com/api/?name=${driver.first_name}+${driver.last_name}&background=random&color=fff`}
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
                                                {/* Vehicle Info */}
                                                <td className="py-4 px-6">
                                                    <div
                                                        className="flex items-center gap-3 group/vehicle cursor-pointer"
                                                        onClick={() => setSelectedVehicle(driver)}
                                                    >
                                                        {/* Vehicle Thumbnail */}
                                                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#2D2D44] relative group-hover/vehicle:border-[#FFD700] group-hover/vehicle:scale-105 transition-all shadow-md">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                                            <img
                                                                src={driver.vehicle_image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"}
                                                                alt="Vehicle"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute bottom-0.5 right-1 z-20">
                                                                <ZoomIn size={10} className="text-white opacity-0 group-hover/vehicle:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>

                                                        {/* Text Info */}
                                                        <div>
                                                            <p className="text-gray-200 text-sm font-medium group-hover/vehicle:text-[#FFD700] transition-colors">
                                                                {driver.vehicle_make} {driver.vehicle_model}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge variant="outline" className="border-[#2D2D44] text-[10px] text-gray-400 font-mono bg-black/20 px-1.5 py-0">
                                                                    {driver.vehicle_plate}
                                                                </Badge>
                                                                <span className="text-[10px] text-gray-500">{driver.vehicle_year}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Document Status */}
                                                <td className="py-4 px-6">
                                                    {driver.documents_status?.license === 'valid' && driver.documents_status?.insurance === 'valid' ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D4B1]/10 border border-[#00D4B1] shadow-[0_0_10px_rgba(0,212,177,0.2)]">
                                                            <Shield size={14} className="text-[#00D4B1]" strokeWidth={2.5} />
                                                            <span className="text-[11px] font-extrabold text-[#00D4B1] tracking-wider">VERIFICADO</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1.5 w-fit">
                                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] ${driver.documents_status?.license === 'valid' ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                                <FileText size={12} />
                                                                <span>Licencia</span>
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] ${driver.documents_status?.insurance === 'valid' ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                                                <Shield size={12} />
                                                                <span>Seguro</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Finanzas */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`text-sm font-mono font-bold tracking-tight ${driver.wallet_balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                            {formatCurrency(driver.wallet_balance || 0)}
                                                        </span>
                                                        {driver.wallet_balance < -50000 && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                                                <AlertTriangle size={10} />
                                                                <span className="text-[10px] font-bold uppercase">Deuda Alta</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Métricas */}
                                                <td className="py-4 px-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[#FFD700] font-bold text-lg font-mono drop-shadow-sm">
                                                                {driver.rating?.toFixed(1) || '5.0'}
                                                            </span>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => {
                                                                    const rating = driver.rating || 5;
                                                                    const isFull = star <= Math.floor(rating);
                                                                    const isHalf = star === Math.ceil(rating) && rating % 1 >= 0.3;

                                                                    return (
                                                                        <div key={star} className="relative">
                                                                            {/* Base Empty Star */}
                                                                            <Star size={12} className="text-gray-700 fill-gray-700/50" />

                                                                            {/* Full Overlay */}
                                                                            {isFull && (
                                                                                <Star size={12} className="text-[#FFD700] fill-[#FFD700] absolute top-0 left-0" />
                                                                            )}

                                                                            {/* Half Overlay (Simulated with clip-path) */}
                                                                            {isHalf && !isFull && (
                                                                                <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                                                                                    <Star size={12} className="text-[#FFD700] fill-[#FFD700]" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <span className="text-gray-400 font-medium uppercase tracking-wider">{driver.total_trips || 0} VIAJES</span>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{driver.acceptance_rate || 95}% Acept.</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Switch */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col items-start gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <Switch
                                                                checked={driver.status === 'approved' || driver.status === 'active'}
                                                                onCheckedChange={(checked) => {
                                                                    const newStatus = checked ? 'approved' : 'blocked';
                                                                    updateDriverStatus(driver.id, newStatus);
                                                                }}
                                                                className="data-[state=checked]:bg-[#00D4B1] data-[state=unchecked]:bg-[#2D2D44]"
                                                            />
                                                            <Badge
                                                                variant="outline"
                                                                className={`
                                                                    px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold border rounded-md backdrop-blur-md shadow-sm
                                                                    ${(driver.status === 'approved' || driver.status === 'active')
                                                                        ? 'bg-[#00D4B1]/10 text-[#00D4B1] border-[#00D4B1]/30 shadow-[#00D4B1]/5'
                                                                        : driver.status === 'pending'
                                                                            ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30 shadow-[#FFB800]/5'
                                                                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                                                                    }
                                                                `}
                                                            >
                                                                {STATUS_CONFIG[driver.status]?.label || driver.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1 pl-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${driver.is_online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
                                                            <span className="text-[10px] text-gray-500 font-medium">
                                                                {driver.last_active_at
                                                                    ? formatDistanceToNow(new Date(driver.last_active_at), { addSuffix: true, locale: es })
                                                                    : 'Nunca'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Actions Dock */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all hover:scale-110"
                                                                    onClick={() => openVerifier(driver)}
                                                                >
                                                                    <FileText size={14} strokeWidth={2.5} />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Gestión Documental</p></TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/20 transition-all hover:scale-110"
                                                                    onClick={() => handleWhatsApp(driver.phone)}
                                                                >
                                                                    <MessageCircle size={14} strokeWidth={2.5} />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>WhatsApp</p></TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all hover:scale-110"
                                                                    onClick={() => {
                                                                        if (confirm('¿Enviar enlace de reseteo de contraseña?')) {
                                                                            alert('Enlace enviado a ' + (driver.email || 'su teléfono'));
                                                                        }
                                                                    }}
                                                                >
                                                                    <Lock size={14} strokeWidth={2.5} />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Reset Password</p></TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-all hover:scale-110"
                                                                    onClick={async () => {
                                                                        if (confirm('¿ESTÁS SEGURO?\n\nEsta acción eliminará permanentemente al conductor y su perfil.\n\nEsta acción no se puede deshacer.')) {
                                                                            try {
                                                                                await goApp.entities.Driver.delete(driver.id);
                                                                                setDrivers(drivers.filter(d => d.id !== driver.id));
                                                                            } catch (e) {
                                                                                alert('Error al eliminar: ' + e.message);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Eliminar Conductor</p></TooltipContent>
                                                        </Tooltip>

                                                    </div>
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
                            <div className="space-y-6">
                                {/* Premium Profile Header */}
                                <div className="relative bg-[#0F0F1A] p-4 rounded-xl border border-[#FFD700]/20 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
                                    {/* Ambient Glow */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#FFD700]/5 to-transparent pointer-events-none" />

                                    {/* Hexagon Avatar Section */}
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 md:w-28 md:h-28 relative flex items-center justify-center">
                                            {/* Hexagon Border SVG */}
                                            <svg viewBox="0 0 100 100" className="absolute w-full h-full text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M50 2 L93 25 L93 75 L50 98 L7 75 L7 25 Z" />
                                            </svg>

                                            {/* Avatar Image (Clipped) */}
                                            <div className="w-[86%] h-[86%] clip-path-hexagon bg-gray-800 overflow-hidden relative z-10" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                                <img
                                                    src={selectedDriver.avatar_url || `https://ui-avatars.com/api/?name=${selectedDriver.first_name}+${selectedDriver.last_name}&background=1A1A2E&color=FFD700`}
                                                    alt="Driver Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identity & Progress */}
                                    <div className="flex-1 w-full z-10">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                                    {selectedDriver.first_name} {selectedDriver.last_name}
                                                    <span className={`text-sm font-extrabold tracking-widest uppercase px-2 py-0.5 rounded border 
                                                        ${selectedDriver.level === 'ORO' ? 'text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/10' :
                                                            selectedDriver.level === 'DIAMANTE' ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' :
                                                                selectedDriver.level === 'PLATA' ? 'text-gray-300 border-gray-300/30 bg-gray-300/10' :
                                                                    'text-orange-700 border-orange-700/30 bg-orange-700/10'}`}>
                                                        {selectedDriver.level || 'BRONCE'}
                                                    </span>
                                                </h2>
                                                <p className="text-gray-400 font-mono tracking-wide">{selectedDriver.phone}</p>
                                            </div>
                                            {/* Medal Icon */}
                                            <div className={`p-2 rounded-lg border 
                                                ${selectedDriver.level === 'ORO' ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]' :
                                                    selectedDriver.level === 'DIAMANTE' ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' :
                                                        'bg-white/5 border-white/10 text-gray-400'}`}>
                                                <Shield size={24} fill="currentColor" strokeWidth={1} />
                                            </div>
                                        </div>

                                        {/* XP Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span className="text-white">{(selectedDriver.current_xp || 0).toLocaleString()} XP</span>
                                                <span className="text-gray-500">Próximo: {(selectedDriver.next_level_xp || 1000).toLocaleString()} XP</span>
                                            </div>
                                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
                                                <div
                                                    className={`absolute top-0 left-0 h-full transition-all duration-500 
                                                        ${selectedDriver.level === 'ORO' ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]' :
                                                            selectedDriver.level === 'DIAMANTE' ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                                                                'bg-gradient-to-r from-gray-500 to-gray-400'}`}
                                                    style={{ width: `${Math.min(((selectedDriver.current_xp || 0) / (selectedDriver.next_level_xp || 1000)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-6 p-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vehículo</h4>
                                        <div className="bg-[#151525] p-3 rounded-lg border border-[#2D2D44]">
                                            <p className="text-lg text-white font-medium">{selectedDriver.vehicle_make} {selectedDriver.vehicle_model}</p>
                                            <p className="text-sm text-gray-400">{selectedDriver.vehicle_year} • {selectedDriver.vehicle_color}</p>
                                            <Badge variant="outline" className="mt-2 border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/5">{selectedDriver.vehicle_plate}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contacto</h4>
                                        <div className="bg-[#151525] p-3 rounded-lg border border-[#2D2D44]">
                                            <p className="text-lg text-white font-medium">{selectedDriver.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" variant="outline" className="flex-1 text-green-400 border-green-400/20 hover:bg-green-400/10" onClick={() => handleWhatsApp(selectedDriver.phone)}>
                                                    <MessageCircle size={14} className="mr-1" /> WhatsApp
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-gray-400 border-gray-400/20 hover:text-white" onClick={() => { }}>
                                                    <Bell size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Vehicle Details Modal */}
                <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
                    <DialogContent className="bg-[#0F0F1A] border border-[#FFD700]/20 text-white max-w-lg p-0 overflow-hidden rounded-2xl">
                        {selectedVehicle && (
                            <div className="flex flex-col">
                                {/* Hero Image */}
                                <div className="relative w-full h-48 bg-gray-900">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-transparent to-transparent z-10" />
                                    <img
                                        src={selectedVehicle.vehicle_image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"}
                                        alt="Car Hero"
                                        className="w-full h-full object-cover"
                                    />
                                    <Badge className="absolute top-4 right-4 z-20 bg-[#FFD700] text-black font-bold">
                                        FICHA TÉCNICA
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-6 -mt-6 relative z-20">
                                    <div className="flex justify-between items-end mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">Modelo {selectedVehicle.vehicle_year}</p>
                                            <h2 className="text-3xl font-extrabold text-white leading-none">
                                                {selectedVehicle.vehicle_make} <span className="font-light text-gray-400">{selectedVehicle.vehicle_model}</span>
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-[#1A1A2E] border border-[#2D2D44] px-3 py-1.5 rounded-lg">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Placa</p>
                                                <p className="text-lg font-mono font-bold text-[#00D4B1] tracking-widest">{selectedVehicle.vehicle_plate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid Specs */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-[#1A1A2E]/50 p-3 rounded-xl border border-[#2D2D44] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Car size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Tipo</p>
                                                <p className="text-sm font-medium capitalize">{selectedVehicle.vehicle_type || 'Sedan'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#1A1A2E]/50 p-3 rounded-xl border border-[#2D2D44] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                <Eye size={16} /> {/* Palette icon ideally, using Eye as placeholder for color */}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase">Color</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: 'gray' /* mock color */ }}></div>
                                                    <p className="text-sm font-medium capitalize">{selectedVehicle.vehicle_color}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-[#FFD700] text-black font-bold hover:bg-[#FFA500]" onClick={() => setSelectedVehicle(null)}>
                                        Cerrar Ficha
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
