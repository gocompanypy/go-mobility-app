import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Save, Plus, Layers, MapPin, Eraser, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { goApp } from '@/api/goAppClient';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom hook to handle map clicks for drawing
const MapEvents = ({ isDrawing, onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (isDrawing) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
};

export default function AdminGeofencing() {
    const navigate = useNavigate();
    const [zones, setZones] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // Editor State
    const [editingZone, setEditingZone] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawPoints, setDrawPoints] = useState([]);

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        try {
            const data = await goApp.entities.Zone.list();
            setZones(data);
        } catch (error) {
            console.error("Error loading zones:", error);
        }
    };

    const openEditor = (zone) => {
        if (zone) {
            setEditingZone({ ...zone });
            setDrawPoints(zone.points || []);
        } else {
            setEditingZone({
                name: '',
                type: 'surge',
                value: 1.0,
                color: '#3B82F6',
                is_active: true,
                points: []
            });
            setDrawPoints([]);
        }
        setIsEditorOpen(true);
        setIsDrawing(false);
    };

    const handleMapClick = (latlng) => {
        setDrawPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    };

    const saveZone = async () => {
        if (drawPoints.length < 3) {
            alert("Una zona debe tener al menos 3 puntos.");
            return;
        }

        const zoneData = {
            ...editingZone,
            points: drawPoints
        };

        try {
            if (zoneData.id) {
                await goApp.entities.Zone.update(zoneData.id, zoneData);
                setZones(zones.map(z => z.id === zoneData.id ? zoneData : z));
            } else {
                const newZone = await goApp.entities.Zone.create(zoneData);
                setZones([...zones, newZone]);
            }
            setIsEditorOpen(false);
        } catch (error) {
            console.error("Error saving zone:", error);
        }
    };

    const startDrawing = () => {
        setDrawPoints([]);
        setIsDrawing(true);
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col">
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
                        <h1 className="text-xl font-bold">Geofencing y Zonas</h1>
                    </div>
                    {/* Only show 'New Zone' if not editing */}
                    {!isEditorOpen && (
                        <Button
                            onClick={() => openEditor(null)}
                            className="bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                        >
                            <Plus size={18} className="mr-2" />
                            Nueva Zona
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
                {/* Sidebar List */}
                {!isEditorOpen ? (
                    <Card className="w-full md:w-1/3 bg-[#1A1A2E] border-r border-[#2D2D44] rounded-none md:max-w-md flex flex-col">
                        <CardHeader className="border-b border-[#2D2D44]">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Layers size={18} /> Zonas Activas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                            {zones.length === 0 && <p className="text-gray-500 text-center py-8">No hay zonas configuradas</p>}
                            {zones.map(zone => (
                                <div
                                    key={zone.id}
                                    className="p-4 rounded-xl border border-[#2D2D44] bg-[#0F0F1A] hover:bg-[#252538] transition-all cursor-pointer relative group"
                                    onClick={() => openEditor(zone)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white pr-8">{zone.name}</h3>
                                        <div className={`w-3 h-3 rounded-full mt-1.5`} style={{ backgroundColor: zone.color }} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="capitalize border-gray-600 text-gray-400 text-xs">
                                            {zone.type === 'surge' ? 'Multiplicador' : zone.type === 'fixed_fare' ? 'Tarifa Fija' : 'Bloqueo'}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                            {zone.type === 'surge' && `x${zone.value}`}
                                            {zone.type === 'fixed_fare' && `Gs. ${zone.value.toLocaleString()}`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    // Editor Panel
                    <Card className="w-full md:w-1/3 bg-[#1A1A2E] border-r border-[#2D2D44] rounded-none md:max-w-md flex flex-col animate-in slide-in-from-left duration-300">
                        <CardHeader className="border-b border-[#2D2D44]">
                            <CardTitle className="text-white text-lg flex items-center justify-between">
                                <span>{editingZone.id ? 'Editar Zona' : 'Nueva Zona'}</span>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Zona</Label>
                                    <Input
                                        value={editingZone.name}
                                        onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                                        className="bg-[#252538] border-[#2D2D44] text-white"
                                        placeholder="Ej. Aeropuerto"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Color de Zona</Label>
                                    <div className="flex gap-2">
                                        {['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'].map(color => (
                                            <button
                                                key={color}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${editingZone.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setEditingZone({ ...editingZone, color })}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo de Regla</Label>
                                    <select
                                        className="w-full p-2 rounded-md bg-[#252538] border border-[#2D2D44] text-white"
                                        value={editingZone.type}
                                        onChange={e => setEditingZone({ ...editingZone, type: e.target.value })}
                                    >
                                        <option value="surge">Surge Pricing (Multiplicador)</option>
                                        <option value="fixed_fare">Tarifa Fija</option>
                                        <option value="blocked">Zona Bloqueada</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        {editingZone.type === 'surge' ? 'Valor Multiplicador (Ej. 1.5)' :
                                            editingZone.type === 'fixed_fare' ? 'Precio Fijo (Gs.)' : 'Valor (Ignorado)'}
                                    </Label>
                                    <Input
                                        type="number"
                                        value={editingZone.value}
                                        onChange={e => setEditingZone({ ...editingZone, value: parseFloat(e.target.value) })}
                                        className="bg-[#252538] border-[#2D2D44] text-white"
                                        disabled={editingZone.type === 'blocked'}
                                    />
                                </div>

                                <div className="space-y-2 pt-4 border-t border-[#2D2D44]">
                                    <Label className="block mb-2">Dibujo del Polígono</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            className={`${isDrawing ? 'bg-red-500 hover:bg-red-600' : 'bg-[#252538] hover:bg-[#32324a]'} flex-1`}
                                            onClick={() => setIsDrawing(!isDrawing)}
                                        >
                                            <MapPin size={16} className="mr-2" />
                                            {isDrawing ? 'Dibujando...' : 'Dibujar puntos'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-[#2D2D44] text-white"
                                            onClick={() => setDrawPoints([])}
                                        >
                                            <Eraser size={16} />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {drawPoints.length === 0 ? 'Haz clic en el mapa para añadir puntos.' : `${drawPoints.length} puntos definidos.`}
                                    </p>
                                </div>
                            </div>

                            <Button className="w-full bg-[#00D4B1] text-black hover:bg-[#00B89C] mt-auto" onClick={saveZone}>
                                <Save size={18} className="mr-2" /> Guardar Cambios
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Map Area */}
                <div className="flex-1 relative z-0">
                    <MapContainer
                        center={[-25.2800, -57.6350]} // Asunción Center
                        zoom={13}
                        style={{ height: '100%', width: '100%', background: '#0F0F1A' }}
                    >
                        {/* Dark Mode Tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        <MapEvents isDrawing={isDrawing} onMapClick={handleMapClick} />

                        {/* Render Saved Zones */}
                        {!isDrawing && zones.map(zone => (
                            zone.points && zone.points.length > 0 && (
                                <Polygon
                                    key={zone.id}
                                    positions={zone.points}
                                    pathOptions={{
                                        color: zone.color,
                                        fillColor: zone.color,
                                        fillOpacity: 0.2,
                                        weight: 2
                                    }}
                                />
                            )
                        ))}

                        {/* Render Active Drawing */}
                        {drawPoints.length > 0 && (
                            <>
                                <Polygon
                                    positions={drawPoints}
                                    pathOptions={{
                                        color: editingZone?.color || '#3B82F6',
                                        fillColor: editingZone?.color || '#3B82F6',
                                        fillOpacity: 0.3,
                                        weight: 2,
                                        dashArray: '5, 5'
                                    }}
                                />
                                {drawPoints.map((pos, idx) => (
                                    <Marker key={idx} position={pos} />
                                ))}
                            </>
                        )}
                    </MapContainer>

                    {/* Drawing Instructions Overlay */}
                    {isDrawing && (
                        <div className="absolute bottom-6 left-6 right-6 md:left-[50%] md:right-auto md:-translate-x-1/2 p-3 bg-black/80 backdrop-blur text-white text-sm rounded-lg border border-white/10 z-[1000] text-center shadow-2xl">
                            <p className="font-bold text-[#00D4B1]">Modo Dibujo Activo</p>
                            <p className="text-gray-300 text-xs">Haz clic en el mapa para marcar los vértices de la zona.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
