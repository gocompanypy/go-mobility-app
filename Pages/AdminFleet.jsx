import React, { useState, useEffect } from 'react';
import { goApp } from '../api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Car, Search, Filter, CheckCircle, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const VehicleAuditModal = ({ vehicle, isOpen, onClose }) => {
    if (!vehicle) return null;
    const [activePhoto, setActivePhoto] = useState('front');

    const photos = [
        { id: 'front', label: 'Frontal', src: vehicle.photos?.front },
        { id: 'back', label: 'Trasera', src: vehicle.photos?.back },
        { id: 'side', label: 'Lateral', src: vehicle.photos?.side },
        { id: 'interior', label: 'Interior', src: vehicle.photos?.interior },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-[#0F0F1A] border-[#2D2D44] text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car size={20} className="text-[#00D4B1]" />
                        Auditoría de Vehículo: {vehicle.make} {vehicle.model} ({vehicle.plate})
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-sm">
                        Revise las fotografías del vehículo para aprobar su estado.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex h-[60vh] gap-4">
                    <div className="w-48 space-y-2">
                        {photos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePhoto(p.id)}
                                className={`w-full text-left p-3 rounded border transition-colors ${activePhoto === p.id ? 'border-[#00D4B1] bg-[#00D4B1]/10 text-[#00D4B1]' : 'border-transparent hover:bg-[#1A1A2E]'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 bg-black flex items-center justify-center relative rounded border border-[#2D2D44]">
                        <img
                            src={photos.find(p => p.id === activePhoto)?.src}
                            alt={activePhoto}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => { e.target.src = 'https://placehold.co/800x600/1a1a2e/ffffff?text=Sin+Foto'; }}
                        />
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                            {photos.find(p => p.id === activePhoto)?.label}
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10" onClick={onClose}>
                        <AlertTriangle size={16} className="mr-2" /> Reportar Daño
                    </Button>
                    <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]" onClick={onClose}>
                        <CheckCircle size={16} className="mr-2" /> Aprobar Estado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function AdminFleet() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [auditVehicle, setAuditVehicle] = useState(null);

    useEffect(() => {
        const loadFleet = async () => {
            setLoading(true);
            try {
                // Ensure goApp.entities.Vehicle exists before calling
                if (goApp.entities.Vehicle) {
                    const data = await goApp.entities.Vehicle.list();
                    setVehicles(data);
                    setFilteredVehicles(data);
                } else {
                    console.error("Vehicle entity missing in goAppClient");
                }
            } catch (error) {
                console.error("Failed to load fleet", error);
            } finally {
                setLoading(false);
            }
        };
        loadFleet();
    }, []);

    const handleFilter = (e) => {
        const value = e.target.value.toLowerCase();
        setFilter(value);
        setFilteredVehicles(vehicles.filter(v =>
            v.plate.toLowerCase().includes(value) ||
            v.make.toLowerCase().includes(value) ||
            v.model.toLowerCase().includes(value) ||
            v.driver_name.toLowerCase().includes(value)
        ));
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
                    <h1 className="text-xl font-bold">Gestión de Flota</h1>
                </div>
            </header>

            <main className="p-6">
                <div className="space-y-6 animate-fade-in">
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D44] flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Car size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-xs">Total Vehículos</p>
                                <p className="text-2xl font-bold text-white">{vehicles.length}</p>
                            </div>
                        </div>
                        <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D44] flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-xs">Activos</p>
                                <p className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'active').length}</p>
                            </div>
                        </div>
                        <div className="bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D44] flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-gray-400 text-xs">Mantenimiento</p>
                                <p className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1A1A2E] p-4 rounded-xl border border-[#2D2D44]">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input
                                placeholder="Buscar por placa, modelo o conductor..."
                                className="bg-[#0F0F1A] border-[#2D2D44] pl-10 text-white placeholder:text-gray-600"
                                value={filter}
                                onChange={handleFilter}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-[#2D2D44] text-white hover:bg-[#2D2D44]">
                                <Filter size={16} className="mr-2" /> Filtros
                            </Button>
                            <Button className="bg-[#00D4B1] text-black hover:bg-[#00B89C]">
                                <Car size={16} className="mr-2" /> Nuevo Vehículo
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0F0F1A] border-b border-[#2D2D44] text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Vehículo</th>
                                        <th className="px-6 py-4 font-medium">Placa</th>
                                        <th className="px-6 py-4 font-medium">Categoría</th>
                                        <th className="px-6 py-4 font-medium">Conductor</th>
                                        <th className="px-6 py-4 font-medium">Estado</th>
                                        <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2D2D44] text-sm text-gray-300">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">Cargando flota...</td></tr>
                                    ) : filteredVehicles.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">No se encontraron vehículos</td></tr>
                                    ) : filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-[#252538] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-[#2D2D44]">
                                                        {vehicle.photos?.front ? (
                                                            <img src={vehicle.photos.front} alt="Car" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Car size={18} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{vehicle.make} {vehicle.model}</div>
                                                        <div className="text-xs text-gray-500">{vehicle.year} • {vehicle.color}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{vehicle.plate}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {vehicle.categories.map(cat => (
                                                        <Badge key={cat} variant="secondary" className="bg-[#00D4B1]/10 text-[#00D4B1] hover:bg-[#00D4B1]/20 border-transparent text-[10px] uppercase">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white hover:underline cursor-pointer">{vehicle.driver_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                    vehicle.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {vehicle.status === 'active' ? 'Activo' : vehicle.status === 'maintenance' ? 'Mantenimiento' : 'Bloqueado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setAuditVehicle(vehicle)}>
                                                    <Eye size={16} className="mr-1" /> Auditar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {auditVehicle && (
                <VehicleAuditModal
                    vehicle={auditVehicle}
                    isOpen={!!auditVehicle}
                    onClose={() => setAuditVehicle(null)}
                />
            )}
        </div>
    );
}
