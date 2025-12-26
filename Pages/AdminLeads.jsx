import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Download, MoreVertical, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

export default function AdminLeads() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Rich Mock Data for Prototyping
    const [leads, setLeads] = useState([
        { id: 1, name: 'Carlos Mendoza', phone: '0981123456', vehicleType: 'Moto', vehicleModel: 'Honda CB1', city: 'Asunción', zone: 'Centro', hasVehicle: true, experience: true, status: 'pending', date: '2024-03-24 10:30' },
        { id: 2, name: 'Ana Estigarribia', phone: '0991876543', vehicleType: 'Auto', vehicleModel: 'Toyota Vitz 2015', city: 'San Lorenzo', zone: 'UNA', hasVehicle: true, experience: false, status: 'contacted', date: '2024-03-24 09:15' },
        { id: 3, name: 'Fernando Torres', phone: '0971555666', vehicleType: 'Moto', vehicleModel: 'Kenton GTR', city: 'Luque', zone: 'Aeropuerto', hasVehicle: true, experience: true, status: 'rejected', date: '2024-03-23 18:45' },
        { id: 4, name: 'Lucía Benítez', phone: '0982333444', vehicleType: 'Auto', vehicleModel: 'Kia Picanto', city: 'Asunción', zone: 'Villa Morra', hasVehicle: true, experience: true, status: 'approved', date: '2024-03-23 14:20' },
        { id: 5, name: 'Marcos Villalba', phone: '0961222333', vehicleType: 'Bike', vehicleModel: 'Mountain Bike', city: 'Asunción', zone: 'Costanera', hasVehicle: true, experience: false, status: 'pending', date: '2024-03-23 11:00' },
        { id: 6, name: 'Sofía Duarte', phone: '0992777888', vehicleType: 'Auto', vehicleModel: '-', city: 'Lambaré', zone: '-', hasVehicle: false, experience: true, status: 'pending', date: '2024-03-22 16:30' },
    ]);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1"><Clock size={12} /> Pendiente</Badge>;
            case 'contacted': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><Phone size={12} /> Contactado</Badge>;
            case 'approved': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1"><CheckCircle size={12} /> Aprobado</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1"><XCircle size={12} /> Rechazado</Badge>;
            default: return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/marketing')} className="text-gray-400 hover:text-white">
                            <ArrowLeft size={24} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Leads & Pre-inscripciones</h1>
                            <p className="text-gray-400 text-sm">Gestiona los conductores interesados antes del lanzamiento.</p>
                        </div>
                    </div>

                    {/* Live Counter */}
                    <Card className="bg-black/80 border-[#FFD700]/50 backdrop-blur-md flex items-center px-8 py-4 gap-6 animate-in zoom-in duration-300 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FFD700] blur-xl opacity-30 animate-pulse"></div>
                            <div className="w-4 h-4 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_15px_#FFD700]"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#FFD700] mb-1">Conductores Registrados</span>
                            <span className="text-5xl font-black text-white leading-none font-mono tracking-tighter">
                                {leads.length.toString().padStart(3, '0')}
                            </span>
                        </div>
                    </Card>

                    <div className="flex gap-2">
                        <Button variant="outline" className="border-[#2D2D44] text-gray-300 gap-2">
                            <Download size={16} /> Exportar CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D44]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                            placeholder="Buscar por nombre o teléfono..."
                            className="pl-10 bg-[#0F0F1A] border-[#2D2D44] text-white focus:border-[#00D4B1]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-[#0F0F1A] border-[#2D2D44] text-white">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="pending">Pendientes</SelectItem>
                            <SelectItem value="contacted">Contactados</SelectItem>
                            <SelectItem value="approved">Aprobados</SelectItem>
                            <SelectItem value="rejected">Rechazados</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="border-[#2D2D44] text-gray-300">
                        <Filter size={18} />
                    </Button>
                </div>

                {/* Table */}
                <Card className="bg-[#1A1A2E] border-[#2D2D44] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#252538]">
                            <TableRow className="border-b border-[#2D2D44] hover:bg-[#252538]">
                                <TableHead className="text-gray-400">Fecha</TableHead>
                                <TableHead className="text-gray-400">Conductor</TableHead>
                                <TableHead className="text-gray-400">Vehículo</TableHead>
                                <TableHead className="text-gray-400">Ubicación</TableHead>
                                <TableHead className="text-gray-400 text-center">Estado</TableHead>
                                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.map((lead) => (
                                <TableRow key={lead.id} className="border-b border-[#2D2D44] hover:bg-[#252538]">
                                    <TableCell className="text-gray-500 text-xs font-mono">{lead.date}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{lead.name}</span>
                                            <span className="text-xs text-gray-500">{lead.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-300">
                                                {lead.vehicleType === 'car' ? '🚗 Auto' : lead.vehicleType === 'moto' ? '🏍️ Moto' : '🚲 Bici'}
                                            </span>
                                            <span className="text-xs text-gray-500">{lead.vehicleModel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-300 capitalize">{lead.city}</span>
                                            <span className="text-xs text-gray-500">{lead.zone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(lead.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                                                onClick={() => window.open(`https://wa.me/595${lead.phone.substring(1)}`, '_blank')}
                                            >
                                                <Phone size={16} />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-[#2D2D44] text-white">
                                                    <DropdownMenuItem className="focus:bg-[#252538] cursor-pointer">
                                                        Marcar como Contactado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-[#252538] cursor-pointer text-green-400">
                                                        Aprobar Registro
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-[#252538] cursor-pointer text-red-400">
                                                        Rechazar / Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
