import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
    ArrowLeft, Megaphone, Tag, Users, Bell, Send, Plus, Trash2, Calendar,
    Percent, DollarSign, Gift, Save, CreditCard, Fuel,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';


export default function AdminMarketing() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('coupons'); // 'coupons', 'notifications', 'referrals', 'agreements'
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [coupons, setCoupons] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [referralConfig, setReferralConfig] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [leads, setLeads] = useState([]);
    const [mockLeadsCount, setMockLeadsCount] = useState(0);

    // Create Coupon State
    const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: '',
        type: 'percent', // percent, fixed
        max_uses: '',
        expires_at: ''
    });

    // Send Notification State
    const [newNotification, setNewNotification] = useState({
        title: '',
        body: '',
        segment: 'all' // all, drivers, passengers
    });

    // Create Agreement State
    const [isCreateAgreementOpen, setIsCreateAgreementOpen] = useState(false);
    const [newAgreement, setNewAgreement] = useState({
        name: '',
        discount: '',
        type: 'fuel', // fuel, service, food, other
        expires_at: ''
    });

    useEffect(() => {
        loadMarketingData();
    }, []);

    const loadMarketingData = async () => {
        setIsLoading(true);
        try {
            const [couponsData, notificationsData, referralData, agreementsData, leadsData, leadsCountData] = await Promise.all([
                goApp.entities.Marketing.Coupons.list(),
                goApp.entities.Marketing.Notifications.list(),
                goApp.entities.Marketing.Referrals.get(),
                goApp.entities.Marketing.Referrals.get(),
                goApp.entities.Marketing.Agreements.list(),
                goApp.entities.Marketing.Leads.list(),
                goApp.entities.Marketing.Leads.count()
            ]);
            setCoupons(couponsData);
            setNotifications(notificationsData);
            setReferralConfig(referralData);
            setAgreements(agreementsData);
            setLeads(leadsData || []);
            setMockLeadsCount(leadsCountData || 0);
        } catch (error) {
            console.error("Error loading marketing data:", error);
        }
        setIsLoading(false);
    };

    // --- Actions: Coupons ---
    const handleCreateCoupon = async () => {
        try {
            const created = await goApp.entities.Marketing.Coupons.create(newCoupon);
            setCoupons([created, ...coupons]);
            setIsCreateCouponOpen(false);
            setNewCoupon({ code: '', discount: '', type: 'percent', max_uses: '', expires_at: '' });
        } catch (error) {
            console.error("Failed to create coupon:", error);
        }
    };

    const toggleCoupon = async (id) => {
        try {
            await goApp.entities.Marketing.Coupons.toggle(id);
            setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
        } catch (error) {
            console.error("Failed to toggle coupon:", error);
        }
    };

    const handleRenewCoupon = async (id) => {
        try {
            // Extend for 30 days
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 30);
            const dateStr = newDate.toISOString().split('T')[0];

            await goApp.entities.Marketing.Coupons.update(id, { expires_at: dateStr, is_active: true });

            setCoupons(coupons.map(c =>
                c.id === id ? { ...c, expires_at: dateStr, is_active: true } : c
            ));
            alert("Cupón renovado por 30 días.");
        } catch (error) {
            console.error("Failed to renew coupon:", error);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este cupón?")) return;
        try {
            await goApp.entities.Marketing.Coupons.delete(id);
            setCoupons(coupons.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete coupon:", error);
        }
    };

    // --- Actions: Notifications ---
    const handleSendNotification = async () => {
        if (!newNotification.title || !newNotification.body) return;
        try {
            const sent = await goApp.entities.Marketing.Notifications.send(newNotification);
            setNotifications([sent, ...notifications]);
            setNewNotification({ title: '', body: '', segment: 'all' });
            alert(`Notificación enviada a ${sent.sent} usuarios.`);
        } catch (error) {
            console.error("Failed to send notification:", error);
        }
    };

    // --- Actions: Referrals ---
    const handleUpdateReferral = async () => {
        try {
            await goApp.entities.Marketing.Referrals.update(referralConfig);
            alert("Configuración de referidos actualizada.");
        } catch (error) {
            console.error("Failed to update referrals:", error);
        }
    };

    // --- Actions: Agreements ---
    const handleCreateAgreement = async () => {
        try {
            const created = await goApp.entities.Marketing.Agreements.create(newAgreement);
            setAgreements([created, ...agreements]);
            setIsCreateAgreementOpen(false);
            setNewAgreement({ name: '', discount: '', type: 'fuel', expires_at: '' });
        } catch (error) {
            console.error("Failed to create agreement:", error);
        }
    };

    const toggleAgreement = async (id) => {
        try {
            await goApp.entities.Marketing.Agreements.toggle(id);
            setAgreements(agreements.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
        } catch (error) {
            console.error("Failed to toggle agreement:", error);
        }
    };


    if (isLoading) {
        return <div className="min-h-screen bg-[#0F0F1A] text-white p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D4B1]"></div>
                <p className="text-gray-400">Cargando módulo de marketing...</p>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-lg border-b border-[#2D2D44]">
                <div className="flex flex-col px-6 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('AdminDashboard'))}
                            className="text-white hover:bg-[#252538]"
                        >
                            <ArrowLeft size={24} />
                        </Button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Megaphone className="text-[#00D4B1]" />
                            Marketing y Lealtad
                        </h1>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons'
                                ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Cupones de Descuento
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications'
                                ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Notificaciones Push
                        </button>
                        <button
                            onClick={() => setActiveTab('referrals')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'referrals'
                                ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Sistema de Referidos
                        </button>
                        <button
                            onClick={() => setActiveTab('agreements')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'agreements'
                                ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Convenios y Estaciones
                        </button>
                        <button
                            onClick={() => navigate('/admin/leads')}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-[#1A1A2E]"
                        >
                            Pre-inscripciones
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-8">

                {/* --- TAB: CUPONES --- */}
                {activeTab === 'coupons' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Cupones Activos</h2>
                                <p className="text-gray-400 text-sm">Gestiona códigos promocionales para usuarios.</p>
                            </div>
                            <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={() => setIsCreateCouponOpen(true)}>
                                <Plus size={18} className="mr-2" /> Crear Cupón
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coupons.map(coupon => {
                                // Logic: Determine State
                                const now = new Date();
                                const expirationDate = new Date(coupon.expires_at);
                                const isExpired = now > expirationDate;

                                // State Configuration
                                let statusConfig = {
                                    label: 'ACTIVO',
                                    color: 'bg-green-500/10 text-green-400 border-green-500/20',
                                    bg: 'bg-[#1A1A2E]'
                                };

                                if (isExpired) {
                                    statusConfig = {
                                        label: 'EXPIRADO',
                                        color: 'bg-red-500/10 text-red-500 border-red-500/20',
                                        bg: 'bg-[#1A1A2E]/50 opacity-75'
                                    };
                                } else if (!coupon.is_active) {
                                    statusConfig = {
                                        label: 'INACTIVO',
                                        color: 'bg-gray-700/20 text-gray-400 border-gray-700/30',
                                        bg: 'bg-[#1A1A2E]/50 opacity-75'
                                    };
                                }

                                return (
                                    <Card key={coupon.id} className={`border-[#2D2D44] relative overflow-hidden group ${statusConfig.bg} transition-all duration-300`}>
                                        <div className="absolute top-0 right-0 p-4">
                                            <Badge variant="outline" className={`${statusConfig.color} border font-bold tracking-wider`}>
                                                {statusConfig.label}
                                            </Badge>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className={`text-xl font-mono ${isExpired ? 'text-gray-500 line-through' : 'text-[#00D4B1]'}`}>
                                                {coupon.code}
                                            </CardTitle>
                                            <CardDescription>
                                                {coupon.type === 'percent' ? `${coupon.discount}% OFF` : `Bs. ${coupon.discount.toLocaleString()} OFF`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between text-sm text-gray-400 border-t border-[#2D2D44] pt-4">
                                                <span>Usos: {coupon.used_count} / {coupon.max_uses}</span>
                                                <span className={`${isExpired ? 'text-red-400 font-bold' : ''}`}>
                                                    Expira: {coupon.expires_at}
                                                </span>
                                            </div>

                                            {/* Action Buttons based on State */}
                                            <div className="flex gap-2">
                                                {isExpired ? (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="flex-1 bg-[#00D4B1] text-black hover:bg-[#00B89C]"
                                                            onClick={() => handleRenewCoupon(coupon.id)}
                                                        >
                                                            Renovar
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-10 px-0"
                                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`w-full border-[#2D2D44] text-white ${coupon.is_active ? 'hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50' : 'hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50'}`}
                                                        onClick={() => toggleCoupon(coupon.id)}
                                                    >
                                                        {coupon.is_active ? 'Desactivar' : 'Activar'}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- TAB: NOTIFICACIONES --- */}
                {activeTab === 'notifications' && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="bg-[#1A1A2E] border-[#2D2D44] lg:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Send className="text-blue-500" size={20} />
                                    Nueva Notificación
                                </CardTitle>
                                <CardDescription>Envía alertas a los usuarios de la app.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título (Corto y llamativo)</Label>
                                    <Input
                                        placeholder="Ej: ¡Descuento sorpresa!"
                                        className="bg-[#252538] border-[#2D2D44] text-white"
                                        value={newNotification.title}
                                        onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mensaje</Label>
                                    <Textarea
                                        placeholder="Escribe el contenido..."
                                        className="bg-[#252538] border-[#2D2D44] text-white min-h-[100px]"
                                        value={newNotification.body}
                                        onChange={(e) => setNewNotification({ ...newNotification, body: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Enviar a:</Label>
                                    <Select
                                        value={newNotification.segment}
                                        onValueChange={(val) => setNewNotification({ ...newNotification, segment: val })}
                                    >
                                        <SelectTrigger className="bg-[#252538] border-[#2D2D44] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                                            <SelectItem value="all">Todos los Usuarios</SelectItem>
                                            <SelectItem value="passengers">Solo Pasajeros</SelectItem>
                                            <SelectItem value="drivers">Solo Conductores</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleSendNotification}>
                                    <Send size={18} className="mr-2" /> Enviar Ahora
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Bell size={20} className="text-gray-400" />
                                Historial de Envíos
                            </h3>
                            <div className="space-y-2">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="bg-[#1A1A2E] border border-[#2D2D44] rounded-lg p-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white">{notif.title}</h4>
                                            <p className="text-gray-400 text-sm mt-1">{notif.body}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="secondary" className="text-[10px] bg-[#252538] text-gray-300">
                                                    {notif.segment === 'all' ? 'Todos' : notif.segment === 'drivers' ? 'Conductores' : 'Pasajeros'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{notif.date}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-400 border-0">
                                            Enviado: {notif.sent}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: REFERIDOS --- */}
                {activeTab === 'referrals' && referralConfig && (
                    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto">
                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardHeader className="text-center border-b border-[#2D2D44] pb-6">
                                <div className="mx-auto w-16 h-16 bg-[#00D4B1]/20 rounded-full flex items-center justify-center mb-4">
                                    <Gift className="text-[#00D4B1]" size={32} />
                                </div>
                                <CardTitle className="text-2xl text-white">Configuración de Referidos</CardTitle>
                                <CardDescription>Define las recompensas por invitar amigos a la app.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center justify-between p-4 bg-[#252538] rounded-lg border border-[#2D2D44]">
                                    <div className="space-y-1">
                                        <Label className="text-base text-white">Activar Sistema de Referidos</Label>
                                        <p className="text-xs text-gray-500">Permitir que los usuarios compartan códigos.</p>
                                    </div>
                                    <Switch
                                        checked={referralConfig.is_active}
                                        onCheckedChange={(checked) => setReferralConfig({ ...referralConfig, is_active: checked })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bono al Nuevo Pasajero (Gs)</Label>
                                        <Input
                                            type="number"
                                            className="bg-[#0F0F1A] border-[#2D2D44] text-white"
                                            value={referralConfig.passenger_bonus}
                                            onChange={(e) => setReferralConfig({ ...referralConfig, passenger_bonus: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bono al que Refiere (Gs)</Label>
                                        <Input
                                            type="number"
                                            className="bg-[#0F0F1A] border-[#2D2D44] text-white"
                                            value={referralConfig.driver_bonus}
                                            onChange={(e) => setReferralConfig({ ...referralConfig, driver_bonus: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Viajes requeridos para desbloquear</Label>
                                    <Input
                                        type="number"
                                        className="bg-[#0F0F1A] border-[#2D2D44] text-white"
                                        value={referralConfig.required_trips}
                                        onChange={(e) => setReferralConfig({ ...referralConfig, required_trips: Number(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-500">El nuevo usuario debe completar estos viajes para que ambos reciban el bono.</p>
                                </div>

                                <Button className="w-full bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleUpdateReferral}>
                                    <Save size={18} className="mr-2" /> Guardar Configuración
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- TAB: AGREEMENTS --- */}
                {activeTab === 'agreements' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Convenios con Aliados</h2>
                                <p className="text-gray-400 text-sm">Gestiona acuerdos con Estaciones de Servicio y Comercios.</p>
                            </div>
                            <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={() => setIsCreateAgreementOpen(true)}>
                                <Plus size={18} className="mr-2" /> Nuevo Convenio
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agreements.map(agreement => (
                                <Card key={agreement.id} className={`border-[#2D2D44] relative overflow-hidden group ${agreement.is_active ? 'bg-[#1A1A2E]' : 'bg-[#1A1A2E]/50 opacity-75'}`}>
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge className={agreement.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}>
                                            {agreement.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </Badge>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-[#252538] flex items-center justify-center text-2xl border border-[#2D2D44]">
                                                {agreement.logo || '🤝'}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-white">{agreement.name}</CardTitle>
                                                <CardDescription className="text-[#00D4B1] font-bold">
                                                    {agreement.discount}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm text-gray-400 border-t border-[#2D2D44] pt-4">
                                            <span>Tipo: {agreement.type === 'fuel' ? 'Combustible' : agreement.type === 'service' ? 'Servicio' : 'Otros'}</span>
                                            <span>Expira: {agreement.expires_at}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-[#2D2D44] hover:bg-[#252538] text-white"
                                            onClick={() => toggleAgreement(agreement.id)}
                                        >
                                            {agreement.is_active ? 'Desactivar' : 'Activar'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Create Agreement Dialog */}
            <Dialog open={isCreateAgreementOpen} onOpenChange={setIsCreateAgreementOpen}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                    <DialogHeader>
                        <DialogTitle>Nuevo Convenio</DialogTitle>
                        <DialogDescription>Registra un nuevo aliado comercial.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre del Comercio</Label>
                            <Input
                                placeholder="Ej: Estación Copetrol"
                                className="bg-[#252538] border-[#2D2D44] text-white"
                                value={newAgreement.name}
                                onChange={(e) => setNewAgreement({ ...newAgreement, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Descuento</Label>
                                <Input
                                    placeholder="Ej: 10% OFF"
                                    className="bg-[#252538] border-[#2D2D44] text-white"
                                    value={newAgreement.discount}
                                    onChange={(e) => setNewAgreement({ ...newAgreement, discount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={newAgreement.type}
                                    onValueChange={(val) => setNewAgreement({ ...newAgreement, type: val })}
                                >
                                    <SelectTrigger className="bg-[#252538] border-[#2D2D44] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                                        <SelectItem value="fuel">Combustible</SelectItem>
                                        <SelectItem value="service">Mecánica/Lavadero</SelectItem>
                                        <SelectItem value="food">Comida/Tienda</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Vigencia hasta</Label>
                            <Input
                                type="date"
                                className="bg-[#252538] border-[#2D2D44] text-white"
                                value={newAgreement.expires_at}
                                onChange={(e) => setNewAgreement({ ...newAgreement, expires_at: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateAgreementOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleCreateAgreement}>
                            Guardar Convenio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Coupon Dialog */}
            <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Cupón</DialogTitle>
                        <DialogDescription>Define las reglas para el código promocional.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código (Ej: VERANO)</Label>
                                <Input
                                    className="bg-[#252538] border-[#2D2D44] text-white uppercase"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expira</Label>
                                <Input
                                    type="date"
                                    className="bg-[#252538] border-[#2D2D44] text-white"
                                    value={newCoupon.expires_at}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Descuento</Label>
                                <Select
                                    value={newCoupon.type}
                                    onValueChange={(val) => setNewCoupon({ ...newCoupon, type: val })}
                                >
                                    <SelectTrigger className="bg-[#252538] border-[#2D2D44] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                                        <SelectItem value="percent">Porcentaje (%)</SelectItem>
                                        <SelectItem value="fixed">Monto Fijo (Gs)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Valor</Label>
                                <Input
                                    type="number"
                                    placeholder={newCoupon.type === 'percent' ? "Ej: 20" : "Ej: 5000"}
                                    className="bg-[#252538] border-[#2D2D44] text-white"
                                    value={newCoupon.discount}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Límite de Usos</Label>
                            <Input
                                type="number"
                                placeholder="Ej: 100"
                                className="bg-[#252538] border-[#2D2D44] text-white"
                                value={newCoupon.max_uses}
                                onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateCouponOpen(false)}>Cancelar</Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={handleCreateCoupon}>
                            Crear Cupón
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
