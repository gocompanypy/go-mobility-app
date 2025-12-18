import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { theme } from '@/components/go/theme';

export default function AdminPricing() {
    const navigate = useNavigate();
    const [priceConfigs, setPriceConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingConfig, setEditingConfig] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const defaultConfig = {
        vehicle_type: 'economy',
        display_name: '',
        description: '',
        base_fare: 2.50,
        price_per_km: 0.90,
        price_per_min: 0.15,
        minimum_fare: 5.00,
        booking_fee: 1.00,
        cancellation_fee: 3.00,
        max_passengers: 4,
        is_active: true,
    };

    useEffect(() => {
        loadPriceConfigs();
    }, []);

    const loadPriceConfigs = async () => {
        try {
            const data = await goApp.entities.PriceConfig.list();
            setPriceConfigs(data);
        } catch (error) {
            console.error('Error loading configs:', error);
        }
        setIsLoading(false);
    };

    const openCreateModal = () => {
        setEditingConfig({ ...defaultConfig });
        setIsModalOpen(true);
    };

    const openEditModal = (config) => {
        setEditingConfig({ ...config });
        setIsModalOpen(true);
    };

    const saveConfig = async () => {
        try {
            if (editingConfig.id) {
                await goApp.entities.PriceConfig.update(editingConfig.id, editingConfig);
                setPriceConfigs(priceConfigs.map(c =>
                    c.id === editingConfig.id ? editingConfig : c
                ));
            } else {
                const newConfig = await goApp.entities.PriceConfig.create(editingConfig);
                setPriceConfigs([...priceConfigs, newConfig]);
            }
            setIsModalOpen(false);
            setEditingConfig(null);
        } catch (error) {
            console.error('Error saving config:', error);
        }
    };

    const deleteConfig = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta configuración?')) return;

        try {
            await goApp.entities.PriceConfig.delete(id);
            setPriceConfigs(priceConfigs.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting config:', error);
        }
    };

    const toggleActive = async (config) => {
        try {
            await goApp.entities.PriceConfig.update(config.id, {
                is_active: !config.is_active
            });
            setPriceConfigs(priceConfigs.map(c =>
                c.id === config.id ? { ...c, is_active: !c.is_active } : c
            ));
        } catch (error) {
            console.error('Error toggling config:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-lg border-b border-[#2D2D44]">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('AdminDashboard'))}
                            className="text-white"
                        >
                            <ArrowLeft size={24} />
                        </Button>
                        <h1 className="text-xl font-bold">Configuración de Tarifas</h1>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                    >
                        <Plus size={18} className="mr-2" />
                        Nueva tarifa
                    </Button>
                </div>
            </header>

            <main className="p-6">
                {/* Info Card */}
                <Card className="bg-[#00D4B1]/10 border-[#00D4B1]/20 mb-6">
                    <CardContent className="p-4">
                        <p className="text-[#00D4B1]">
                            💡 Las tarifas se calculan como: <strong>Tarifa base + (Precio/km × distancia) + (Precio/min × tiempo)</strong>.
                            El resultado nunca será menor que la tarifa mínima.
                        </p>
                    </CardContent>
                </Card>

                {/* Price Configs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {priceConfigs.map((config) => {
                        const vehicleConfig = theme.vehicleTypes[config.vehicle_type] || {};

                        return (
                            <Card
                                key={config.id}
                                className={`bg-[#1A1A2E] border-[#2D2D44] ${!config.is_active ? 'opacity-50' : ''}`}
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{vehicleConfig.icon || '🚗'}</span>
                                        <div>
                                            <CardTitle className="text-white text-lg">
                                                {config.display_name || vehicleConfig.name || config.vehicle_type}
                                            </CardTitle>
                                            <p className="text-gray-400 text-sm">
                                                {config.description || vehicleConfig.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.is_active}
                                        onCheckedChange={() => toggleActive(config)}
                                        className="data-[state=checked]:bg-[#00D4B1]"
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Tarifa base</span>
                                            <span className="text-white font-medium">Gs. {config.base_fare?.toLocaleString('es-PY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Precio/km</span>
                                            <span className="text-white font-medium">Gs. {config.price_per_km?.toLocaleString('es-PY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Precio/min</span>
                                            <span className="text-white font-medium">Gs. {config.price_per_min?.toLocaleString('es-PY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Tarifa mínima</span>
                                            <span className="text-[#00D4B1] font-medium">Gs. {config.minimum_fare?.toLocaleString('es-PY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Fee de reserva</span>
                                            <span className="text-white font-medium">Gs. {config.booking_fee?.toLocaleString('es-PY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Fee cancelación</span>
                                            <span className="text-white font-medium">Gs. {config.cancellation_fee?.toLocaleString('es-PY')}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#2D2D44]">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-[#2D2D44] hover:bg-[#252538]"
                                            onClick={() => openEditModal(config)}
                                        >
                                            <Edit2 size={14} className="mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                            onClick={() => deleteConfig(config.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {priceConfigs.length === 0 && !isLoading && (
                        <Card className="bg-[#1A1A2E] border-[#2D2D44] col-span-full">
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-400 mb-4">No hay tarifas configuradas</p>
                                <Button onClick={openCreateModal} className="bg-[#00D4B1] hover:bg-[#00B89C] text-black">
                                    <Plus size={18} className="mr-2" />
                                    Crear primera tarifa
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            {/* Edit/Create Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConfig?.id ? 'Editar Tarifa' : 'Nueva Tarifa'}
                        </DialogTitle>
                    </DialogHeader>

                    {editingConfig && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de vehículo</Label>
                                    <Select
                                        value={editingConfig.vehicle_type}
                                        onValueChange={(value) => setEditingConfig({
                                            ...editingConfig,
                                            vehicle_type: value,
                                            display_name: theme.vehicleTypes[value]?.name || '',
                                            description: theme.vehicleTypes[value]?.description || '',
                                        })}
                                        disabled={!!editingConfig.id}
                                    >
                                        <SelectTrigger className="bg-[#252538] border-[#2D2D44]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A2E] border-[#2D2D44]">
                                            {Object.entries(theme.vehicleTypes).map(([key, config]) => (
                                                <SelectItem key={key} value={key} className="text-white">
                                                    <span className="flex items-center gap-2">
                                                        <span>{config.icon}</span>
                                                        <span>{config.name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre a mostrar</Label>
                                    <Input
                                        value={editingConfig.display_name}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, display_name: e.target.value })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tarifa base (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.base_fare}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, base_fare: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tarifa mínima (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.minimum_fare}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, minimum_fare: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Precio por km (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.price_per_km}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, price_per_km: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio por min (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.price_per_min}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, price_per_min: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fee de reserva (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.booking_fee}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, booking_fee: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fee cancelación (Gs.)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editingConfig.cancellation_fee}
                                        onChange={(e) => setEditingConfig({ ...editingConfig, cancellation_fee: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={editingConfig.is_active}
                                        onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, is_active: checked })}
                                        className="data-[state=checked]:bg-[#00D4B1]"
                                    />
                                    <Label>Tarifa activa</Label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-[#2D2D44]"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                                    onClick={saveConfig}
                                >
                                    <Save size={18} className="mr-2" />
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
