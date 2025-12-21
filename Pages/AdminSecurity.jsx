import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
    ArrowLeft, Shield, AlertTriangle, MessageSquare, Users, MapPin,
    CheckCircle, XCircle, Siren, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

export default function AdminSecurity() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'disputes', 'users'
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [disputes, setDisputes] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [riskUsers, setRiskUsers] = useState([]);

    // Modals
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [disputeResolution, setDisputeResolution] = useState('');

    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        setIsLoading(true);
        try {
            const [disputesData, sosData, usersData] = await Promise.all([
                goApp.entities.Security.Disputes.list(),
                goApp.entities.Security.SOS.listActive(),
                goApp.entities.Security.Users.listRisk()
            ]);
            setDisputes(disputesData);
            setSosAlerts(sosData);
            setRiskUsers(usersData);
        } catch (error) {
            console.error("Error loading security data:", error);
        }
        setIsLoading(false);
    };

    // --- Actions: SOS ---
    const handleResolveSOS = async (id) => {
        try {
            await goApp.entities.Security.SOS.resolve(id);
            setSosAlerts(sosAlerts.filter(a => a.id !== id));
            alert("Alerta de emergencia resuelta.");
        } catch (error) {
            console.error("Failed to resolve SOS:", error);
        }
    };

    // --- Actions: Disputes ---
    const handleResolveDispute = async (status) => {
        if (!selectedDispute) return;
        try {
            await goApp.entities.Security.Disputes.resolve(selectedDispute.id, { status, note: disputeResolution });
            setDisputes(disputes.map(d => d.id === selectedDispute.id ? { ...d, status: 'resolved' } : d));
            setSelectedDispute(null);
            setDisputeResolution('');
        } catch (error) {
            console.error("Failed to resolve dispute:", error);
        }
    };

    // --- Actions: Users ---
    const handleToggleBan = async (user) => {
        const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
        try {
            await goApp.entities.Security.Users.toggleBan(user.id, newStatus);
            setRiskUsers(riskUsers.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Failed to toggle ban:", error);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-[#0F0F1A] text-white p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D4B1]"></div>
                <p className="text-gray-400">Cargando centro de seguridad...</p>
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
                            <Shield className="text-[#00D4B1]" />
                            Seguridad y Soporte
                        </h1>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('sos')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'sos'
                                    ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            <Siren size={16} className={activeTab === 'sos' ? "animate-pulse" : ""} />
                            Centro de Monitoreo (SOS)
                            {sosAlerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{sosAlerts.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('disputes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'disputes'
                                    ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Disputas de Viajes
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users'
                                    ? 'bg-[#252538] text-white border border-[#2D2D44]'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`}
                        >
                            Moderación de Usuarios
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-8">

                {/* --- TAB: SOS --- */}
                {activeTab === 'sos' && (
                    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Fake Map */}
                        <div className="lg:col-span-2 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl overflow-hidden h-[500px] relative">
                            <img
                                src="https://placehold.co/1000x600/111/444?text=Mapa+en+Tiempo+Real+-+Sin+Alertas"
                                className="w-full h-full object-cover opacity-50"
                                alt="Map Mock"
                            />
                            {/* Mock Markers */}
                            {sosAlerts.map((alert, index) => (
                                <div
                                    key={alert.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{ top: `${40 + (index * 10)}%`, left: `${40 + (index * 20)}%` }}
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-red-500/30 rounded-full animate-ping"></div>
                                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg shadow-red-900/50">
                                            <Siren size={24} />
                                        </div>
                                        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            {alert.user} ({alert.type})
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sosAlerts.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-green-500/10 text-green-500 px-6 py-3 rounded-full backdrop-blur-md border border-green-500/30 flex items-center gap-2">
                                        <CheckCircle size={20} /> Sistema Normal. Sin emergencias activas.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alert List */}
                        <div className="space-y-4 h-[500px] overflow-auto">
                            {sosAlerts.map(alert => (
                                <Card key={alert.id} className="bg-red-900/10 border-red-500/50 border">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge className="bg-red-500 text-white animate-pulse">EMERGENCIA</Badge>
                                            <span className="text-xs text-red-300">{alert.time}</span>
                                        </div>
                                        <CardTitle className="text-white text-lg mt-2">{alert.type === 'panic_button' ? 'Botón de Pánico' : 'Desvío Detectado'}</CardTitle>
                                        <CardDescription className="text-red-200">
                                            Usuario: <span className="font-bold text-white">{alert.user}</span> ({alert.role})
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 text-sm text-gray-400 mb-4">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> Centro</span>
                                            <span className="flex items-center gap-1">🔋 {alert.battery}%</span>
                                        </div>
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => handleResolveSOS(alert.id)}>
                                            <CheckCircle size={18} className="mr-2" /> Marcar como Resuelto
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: DISPUTES --- */}
                {activeTab === 'disputes' && (
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardHeader className="border-b border-[#2D2D44]">
                            <CardTitle className="text-white flex items-center gap-2">
                                <MessageSquare className="text-yellow-500" size={20} />
                                Reclamos Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-[#0F0F1A]">
                                    <TableRow className="border-[#2D2D44] hover:bg-transparent">
                                        <TableHead className="text-gray-400">ID Viaje</TableHead>
                                        <TableHead className="text-gray-400">Usuario</TableHead>
                                        <TableHead className="text-gray-400">Tipo</TableHead>
                                        <TableHead className="text-gray-400">Estado</TableHead>
                                        <TableHead className="text-right text-gray-400">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {disputes.map((dispute) => (
                                        <TableRow key={dispute.id} className="border-[#2D2D44] hover:bg-[#252538]">
                                            <TableCell className="font-mono text-gray-300">{dispute.trip_id}</TableCell>
                                            <TableCell className="text-white">
                                                <div className="flex flex-col">
                                                    <span>{dispute.user}</span>
                                                    <span className="text-xs text-gray-500 capitalize">{dispute.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">{dispute.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={dispute.status === 'pending' ? "text-yellow-500 border-yellow-500" : "text-green-500 border-green-500"}>
                                                    {dispute.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {dispute.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-[#00D4B1] hover:bg-[#00D4B1]/10"
                                                        onClick={() => setSelectedDispute(dispute)}
                                                    >
                                                        <Eye size={16} className="mr-2" /> Revisar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* --- TAB: USERS --- */}
                {activeTab === 'users' && (
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardHeader className="border-b border-[#2D2D44]">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="text-blue-500" size={20} />
                                Usuarios de Alto Riesgo
                            </CardTitle>
                            <CardDescription>Usuarios con reportes recientes o baja calificación.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-[#0F0F1A]">
                                    <TableRow className="border-[#2D2D44] hover:bg-transparent">
                                        <TableHead className="text-gray-400">Usuario</TableHead>
                                        <TableHead className="text-gray-400">Rol</TableHead>
                                        <TableHead className="text-gray-400 text-center">Rating</TableHead>
                                        <TableHead className="text-gray-400 text-center">Reportes</TableHead>
                                        <TableHead className="text-gray-400">Último Incidente</TableHead>
                                        <TableHead className="text-gray-400">Estado</TableHead>
                                        <TableHead className="text-right text-gray-400">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {riskUsers.map((user) => (
                                        <TableRow key={user.id} className="border-[#2D2D44] hover:bg-[#252538]">
                                            <TableCell className="font-medium text-white">{user.name}</TableCell>
                                            <TableCell className="text-gray-400 capitalize">{user.role}</TableCell>
                                            <TableCell className="text-center font-bold text-yellow-500">{user.rating}</TableCell>
                                            <TableCell className="text-center text-red-400">{user.reports}</TableCell>
                                            <TableCell className="text-gray-400 text-sm">{user.last_incident}</TableCell>
                                            <TableCell>
                                                <Badge className={user.status === 'active' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                                                    {user.status === 'active' ? 'Activo' : 'Bloqueado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={user.status === 'active' ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"}
                                                    onClick={() => handleToggleBan(user)}
                                                >
                                                    {user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Dispute Resolution Dialog */}
            <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                    <DialogHeader>
                        <DialogTitle>Resolver Disputa #{selectedDispute?.trip_id}</DialogTitle>
                        <DialogDescription>
                            Motivo: <span className="text-white font-medium">{selectedDispute?.reason}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Nota de resolución</Label>
                        <Textarea
                            className="bg-[#252538] border-[#2D2D44] text-white"
                            placeholder="Explica la decisión tomada..."
                            value={disputeResolution}
                            onChange={(e) => setDisputeResolution(e.target.value)}
                        />
                        {selectedDispute?.amount > 0 && (
                            <p className="text-xs text-yellow-500">
                                Monto en disputa: Gs. {selectedDispute.amount.toLocaleString()}
                            </p>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-900/20" onClick={() => handleResolveDispute('rejected')}>
                            Rechazar Reclamo
                        </Button>
                        <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={() => handleResolveDispute('refunded')}>
                            Reembolsar / Aprobar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
