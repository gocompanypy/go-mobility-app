import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
    ArrowLeft, Wallet, TrendingUp, AlertCircle, Download, CreditCard,
    DollarSign, CheckCircle, Settings, Map, Zap, Edit2, Save, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge'; // Assuming Badge exists or will fallback to generic if not, but typically shadcn has it. If not I will remove or use div.
// Note: Badge was used in the previous file content (line 251), so it exists.

import { theme } from '@/components/go/theme';

export default function AdminFinance() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'tariffs', 'zones'
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [stats, setStats] = useState(null);
    const [debtors, setDebtors] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [priceConfigs, setPriceConfigs] = useState([]);
    const [zones, setZones] = useState([]);

    // Payment Modal State
    const [selectedDebtor, setSelectedDebtor] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Tariff Edit State
    const [editingTariff, setEditingTariff] = useState(null);

    // Zone Edit State
    const [editingZone, setEditingZone] = useState(null);

    useEffect(() => {
        loadFinanceData();
    }, []);

    const loadFinanceData = async () => {
        setIsLoading(true);
        try {
            // Load independently so one failure doesn't block others
            const [statsResult, debtorsResult, payoutsResult, tariffResult, zoneResult] = await Promise.allSettled([
                goApp.entities.Wallet.getStats(),
                goApp.entities.Wallet.listDebtors(),
                goApp.entities.Wallet.listPayouts(),
                goApp.entities.PriceConfig.list(),
                goApp.entities.Zone.list()
            ]);

            if (statsResult.status === 'fulfilled') setStats(statsResult.value);
            if (debtorsResult.status === 'fulfilled') setDebtors(debtorsResult.value);
            if (payoutsResult.status === 'fulfilled') setPayouts(payoutsResult.value);

            if (tariffResult.status === 'fulfilled') {
                console.log("Tariffs loaded:", tariffResult.value);
                setPriceConfigs(tariffResult.value || []);
            } else {
                console.error("Error loading prices:", tariffResult.reason);
            }

            if (zoneResult.status === 'fulfilled') setZones(zoneResult.value);

        } catch (error) {
            console.error("CRITICAL Error loading finance data:", error);
        }
        setIsLoading(false);
    };

    const openCreateTariffModal = () => {
        setEditingTariff({
            vehicle_type: 'economy',
            display_name: 'Nueva Tarifa',
            base_fare: 5000,
            price_per_km: 3000,
            price_per_min: 500,
            minimum_fare: 10000,
            is_active: true
        });
    };

    // --- Actions: Finance ---

    const handlePayment = async () => {
        if (!selectedDebtor || !paymentAmount) return;
        try {
            await goApp.entities.Wallet.markPaid(selectedDebtor.id, parseFloat(paymentAmount));
            setDebtors(debtors.map(d =>
                d.id === selectedDebtor.id
                    ? { ...d, debt: d.debt - parseFloat(paymentAmount) }
                    : d
            ).filter(d => d.debt > 0));
            setSelectedDebtor(null);
            setPaymentAmount('');
            const newStats = await goApp.entities.Wallet.getStats();
            setStats(newStats);
        } catch (error) {
            console.error("Payment failed:", error);
        }
    };

    const generatePayout = async () => {
        try {
            await goApp.entities.Wallet.generatePayout();
            alert("Archivo de pagos generado exitosamente. (Simulación)");
        } catch (error) {
            console.error("Payout failed:", error);
        }
    };

    // --- Actions: Tarifas ---

    const handleSaveTariff = async () => {
        if (!editingTariff) return;
        try {
            if (editingTariff.id) {
                // Update existing
                await goApp.entities.PriceConfig.update(editingTariff.id, editingTariff);
                setPriceConfigs(priceConfigs.map(p => p.id === editingTariff.id ? editingTariff : p));
            } else {
                // Create new
                const newConfig = await goApp.entities.PriceConfig.create(editingTariff);
                setPriceConfigs([...priceConfigs, newConfig]);
            }
            setEditingTariff(null);
        } catch (error) {
            console.error("Failed to save tariff:", error);
        }
    };

    // --- Actions: Zonas ---

    const handleUpdateZone = async () => {
        if (!editingZone) return;
        try {
            await goApp.entities.Zone.update(editingZone.id, editingZone);
            setZones(zones.map(z => z.id === editingZone.id ? editingZone : z));
            setEditingZone(null);
        } catch (error) {
            console.error("Failed to update zone:", error);
        }
    };

    const toggleZoneActive = async (zone) => {
        const updated = { ...zone, is_active: !zone.is_active };
        try {
            await goApp.entities.Zone.update(zone.id, updated);
            setZones(zones.map(z => z.id === zone.id ? updated : z));
        } catch (error) {
            console.error("Failed to toggle zone:", error);
        }
    };


    if (isLoading) {
        return <div className="min-h-screen bg-[#0F0F1A] text-white p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D4B1]"></div>
                <p className="text-gray-400">Cargando datos financieros...</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white font-sans">
            {/* Header */}
            <main className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary'
                            ? 'bg-[#252538] text-white border border-[#2D2D44]'
                            : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                            }`}
                    >
                        Resumen Financiero
                    </button>
                    <button
                        onClick={() => setActiveTab('tariffs')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tariffs'
                            ? 'bg-[#252538] text-white border border-[#2D2D44]'
                            : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                            }`}
                    >
                        Configuración de Tarifas
                    </button>
                    <button
                        onClick={() => setActiveTab('zones')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'zones'
                            ? 'bg-[#252538] text-white border border-[#2D2D44]'
                            : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                            }`}
                    >
                        Zonas & Surge Pricing
                    </button>
                </div>

                {/* --- TAB: RESUMEN FINANCIERO --- */}
                {activeTab === 'summary' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-400 text-sm font-medium uppercase">Ingresos Totales (Bruto)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        <DollarSign size={20} className="text-[#00D4B1]" />
                                        {stats?.total_revenue?.toLocaleString('es-PY') || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-400 text-sm font-medium uppercase text-red-400">Deuda Conductores</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        <AlertCircle size={20} className="text-red-500" />
                                        {stats?.pending_collections?.toLocaleString('es-PY') || '0'}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Comisiones pendientes de cobro</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-400 text-sm font-medium uppercase text-yellow-400">Pagos Pendientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        <CreditCard size={20} className="text-yellow-500" />
                                        {stats?.pending_payouts?.toLocaleString('es-PY') || '0'}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">A pagar a conductores (Semanal)</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-400 text-sm font-medium uppercase text-blue-400">Balance Disponible</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                                        <TrendingUp size={20} className="text-blue-500" />
                                        {stats?.platform_balance?.toLocaleString('es-PY') || '0'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Debtors List */}
                            <Card className="bg-[#1A1A2E] border-[#2D2D44] lg:col-span-2 flex flex-col">
                                <CardHeader className="border-b border-[#2D2D44]">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertCircle className="text-red-500" size={20} />
                                        Conductores con Deuda (Cobro Manual)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 overflow-auto max-h-[500px]">
                                    <Table>
                                        <TableHeader className="bg-[#0F0F1A]">
                                            <TableRow className="border-[#2D2D44] hover:bg-transparent">
                                                <TableHead className="text-gray-400">Conductor</TableHead>
                                                <TableHead className="text-gray-400">Teléfono</TableHead>
                                                <TableHead className="text-gray-400 text-right">Deuda Total</TableHead>
                                                <TableHead className="text-gray-400">Último Pago</TableHead>
                                                <TableHead className="text-right text-gray-400">Acción</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {debtors.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                                        No hay deudas pendientes. ¡Excelente!
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                debtors.map((debtor) => (
                                                    <TableRow key={debtor.id} className="border-[#2D2D44] hover:bg-[#252538]">
                                                        <TableCell className="font-medium text-white">{debtor.name}</TableCell>
                                                        <TableCell className="text-gray-400">{debtor.phone}</TableCell>
                                                        <TableCell className="text-right text-red-500 font-bold">
                                                            Gs. {debtor.debt.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-gray-400">{debtor.last_payment}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#00D4B1] text-black hover:bg-[#00B89C]"
                                                                onClick={() => {
                                                                    setSelectedDebtor(debtor);
                                                                    setPaymentAmount(debtor.debt.toString());
                                                                }}
                                                            >
                                                                Cobrar
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Payouts Simulation */}
                            <Card className="bg-[#1A1A2E] border-[#2D2D44] flex flex-col h-fit">
                                <CardHeader className="border-b border-[#2D2D44]">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CreditCard className="text-yellow-500" size={20} />
                                        Gestión de Pagos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="bg-[#252538] p-4 rounded-xl border border-[#2D2D44]">
                                        <p className="text-gray-400 text-sm mb-1">Monto acumulado a pagar</p>
                                        <p className="text-3xl font-bold text-white mb-4">
                                            Gs. {stats?.pending_payouts.toLocaleString()}
                                        </p>
                                        <Button className="w-full bg-[#FFD700] text-black hover:bg-[#E6C200]" onClick={generatePayout}>
                                            <Download size={18} className="mr-2" />
                                            Generar Archivo de Pago
                                        </Button>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-medium mb-3">Historial de Pagos</h4>
                                        <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
                                            {payouts.map(payout => (
                                                <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg border border-[#2D2D44] bg-[#0F0F1A]">
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{payout.date}</p>
                                                        <p className="text-xs text-gray-500">{payout.count} conductores</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[#00D4B1] text-sm font-bold">
                                                            Gs. {(payout.amount / 1000000).toFixed(1)}M
                                                        </p>
                                                        <Badge variant="secondary" className="bg-[#00D4B1]/10 text-[#00D4B1] text-[10px]">
                                                            {payout.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* --- TAB: TARIFAS --- */}
                {activeTab === 'tariffs' && (
                    <div className="animate-in fade-in duration-300">
                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardHeader className="border-b border-[#2D2D44] flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Settings className="text-[#00D4B1]" size={20} />
                                        Configuración de Precios
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Ajusta los costos base para cada categoría de servicio.
                                    </CardDescription>
                                </div>
                                <Button variant="outline" className="border-[#2D2D44] text-gray-400 hover:text-white hover:bg-[#252538]">
                                    <Download size={16} className="mr-2" /> Exportar Tarifario
                                </Button>
                                <Button onClick={openCreateTariffModal} className="ml-2 bg-[#00D4B1] text-black hover:bg-[#00B89C]">
                                    <Plus size={16} className="mr-2" /> Nueva Tarifa
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-[#0F0F1A]">
                                        <TableRow className="border-[#2D2D44] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Categoría</TableHead>
                                            <TableHead className="text-gray-400 text-right">Tarifa Base (Gs)</TableHead>
                                            <TableHead className="text-gray-400 text-right">x Km</TableHead>
                                            <TableHead className="text-gray-400 text-right">x Min</TableHead>
                                            <TableHead className="text-gray-400 text-right">Tarifa Mínima</TableHead>
                                            <TableHead className="text-gray-400 text-center">Estado</TableHead>
                                            <TableHead className="text-right text-gray-400">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {priceConfigs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                                                    No hay tarifas configuradas. ¡Crea una nueva!
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            priceConfigs.map((config) => (
                                                <TableRow key={config.id} className="border-[#2D2D44] hover:bg-[#252538]">
                                                    <TableCell className="font-medium text-white flex items-center gap-2">
                                                        {config.name}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-300">{config.base_fare.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-gray-300">{config.price_per_km.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-gray-300">{config.price_per_min.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-gray-300">{config.minimum_fare.toLocaleString()}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={config.is_active ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-red-500/20 text-red-500"}>
                                                            {config.is_active ? "Activo" : "Inactivo"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[#00D4B1] hover:bg-[#00D4B1]/10 hover:text-[#00D4B1]"
                                                            onClick={() => setEditingTariff(config)}
                                                        >
                                                            <Edit2 size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )
                }

                {/* --- TAB: ZONAS --- */}
                {
                    activeTab === 'zones' && (
                        <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {zones.map(zone => (
                                <Card key={zone.id} className="bg-[#1A1A2E] border-[#2D2D44] relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-3 rounded-bl-xl ${zone.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                        {zone.is_active ? 'Activa' : 'Inactiva'}
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Map className="text-blue-500" size={20} />
                                            {zone.name}
                                        </CardTitle>
                                        <CardDescription>
                                            Tipo: {zone.type === 'surge' ? 'Tarifa Dinámica' : 'Tarifa Fija'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between bg-[#252538] p-4 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Zap className={zone.type === 'surge' ? "text-yellow-500" : "text-gray-500"} size={24} />
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">
                                                        {zone.type === 'surge' ? 'Multiplicador' : 'Costo Fijo'}
                                                    </p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {zone.type === 'surge' ? `${zone.value}x` : `Gs. ${zone.value.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-[#2D2D44] hover:bg-[#3d3d5c] text-white"
                                                onClick={() => setEditingZone(zone)}
                                            >
                                                <Settings size={16} /> Configurar
                                            </Button>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className={`w-full border-[#2D2D44] ${zone.is_active ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'}`}
                                                onClick={() => toggleZoneActive(zone)}
                                            >
                                                {zone.is_active ? 'Desactivar Zona' : 'Activar Zona'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Card className="bg-[#1A1A2E]/50 border-[#2D2D44] border-dashed border-2 flex items-center justify-center p-8 cursor-pointer hover:bg-[#1A1A2E] hover:border-[#00D4B1] transition-colors group">
                                <div className="text-center space-y-2 group-hover:scale-105 transition-transform">
                                    <div className="bg-[#252538] p-4 rounded-full w-fit mx-auto group-hover:bg-[#00D4B1]/20">
                                        <Map className="text-gray-400 group-hover:text-[#00D4B1]" size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-white">Crear Nueva Zona</h3>
                                    <p className="text-sm text-gray-500">Dibuja un polígono en el mapa</p>
                                </div>
                            </Card>
                        </div>
                    )
                }
            </main >

            {/* --- DIALOGS --- */}

            {/* Payment Dialog */}
            <Dialog open={!!selectedDebtor} onOpenChange={() => setSelectedDebtor(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                    <DialogHeader>
                        <DialogTitle>Registrar Pago Manual</DialogTitle>
                        <DialogDescription>
                            Registrar cobro de comisión en efectivo a {selectedDebtor?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Monto a cobrar (Gs.)</Label>
                            <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="bg-[#252538] border-[#2D2D44] text-white"
                            />
                            <p className="text-xs text-gray-500">
                                Deuda total: Gs. {selectedDebtor?.debt.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedDebtor(null)}>Cancelar</Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handlePayment}>
                            <CheckCircle size={18} className="mr-2" /> Confirmar Pago
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tariff Edit/Create Dialog */}
            <Dialog open={!!editingTariff} onOpenChange={() => setEditingTariff(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingTariff?.id ? 'Editar Tarifa' : 'Nueva Tarifa'}</DialogTitle>
                        <DialogDescription>
                            Configura los parámetros de cobro para este tipo de vehículo.
                        </DialogDescription>
                    </DialogHeader>
                    {editingTariff && (
                        <div className="grid gap-4 py-4">
                            {!editingTariff.id && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-gray-400">Tipo</Label>
                                    <div className="col-span-3">
                                        <select
                                            value={editingTariff.vehicle_type}
                                            onChange={(e) => {
                                                const type = e.target.value;
                                                setEditingTariff({
                                                    ...editingTariff,
                                                    vehicle_type: type,
                                                    display_name: theme.vehicleTypes[type]?.name || type
                                                });
                                            }}
                                            className="w-full bg-[#252538] border border-[#2D2D44] text-white rounded-md p-2"
                                        >
                                            {Object.entries(theme.vehicleTypes).map(([key, value]) => (
                                                <option key={key} value={key}>{value.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-400">Nombre</Label>
                                <Input
                                    value={editingTariff.display_name}
                                    onChange={(e) => setEditingTariff({ ...editingTariff, display_name: e.target.value })}
                                    className="col-span-3 bg-[#252538] border-[#2D2D44] text-white"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-400">Base Gs.</Label>
                                <Input
                                    type="number"
                                    value={editingTariff.base_fare}
                                    onChange={(e) => setEditingTariff({ ...editingTariff, base_fare: Number(e.target.value) })}
                                    className="col-span-3 bg-[#252538] border-[#2D2D44] text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-400">x Km</Label>
                                <Input
                                    type="number"
                                    value={editingTariff.price_per_km}
                                    onChange={(e) => setEditingTariff({ ...editingTariff, price_per_km: Number(e.target.value) })}
                                    className="col-span-3 bg-[#252538] border-[#2D2D44] text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-400">x Min</Label>
                                <Input
                                    type="number"
                                    value={editingTariff.price_per_min}
                                    onChange={(e) => setEditingTariff({ ...editingTariff, price_per_min: Number(e.target.value) })}
                                    className="col-span-3 bg-[#252538] border-[#2D2D44] text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-gray-400">Mínima</Label>
                                <Input
                                    type="number"
                                    value={editingTariff.minimum_fare}
                                    onChange={(e) => setEditingTariff({ ...editingTariff, minimum_fare: Number(e.target.value) })}
                                    className="col-span-3 bg-[#252538] border-[#2D2D44] text-white"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingTariff(null)}>Cancelar</Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleSaveTariff}>
                            <Save size={18} className="mr-2" /> Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Zone Edit Dialog */}
            <Dialog open={!!editingZone} onOpenChange={() => setEditingZone(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Zona: {editingZone?.name}</DialogTitle>
                        <DialogDescription>
                            {editingZone?.type === 'surge' ? 'Ajusta el multiplicador de demanda.' : 'Ajusta el costo fijo de la zona.'}
                        </DialogDescription>
                    </DialogHeader>
                    {editingZone && (
                        <div className="py-4">
                            <Label className="mb-2 block text-gray-400">
                                {editingZone.type === 'surge' ? 'Multiplicador (ej. 1.5 = +50%)' : 'Costo Fijo (Gs.)'}
                            </Label>
                            <Input
                                type="number"
                                step={editingZone.type === 'surge' ? "0.1" : "1000"}
                                value={editingZone.value}
                                onChange={(e) => setEditingZone({ ...editingZone, value: Number(e.target.value) })}
                                className="bg-[#252538] border-[#2D2D44] text-white text-lg font-bold"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingZone(null)}>Cancelar</Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleUpdateZone}>
                            <Save size={18} className="mr-2" /> Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
