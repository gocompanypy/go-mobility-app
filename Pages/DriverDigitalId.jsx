import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, QrCode, Star, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DriverDigitalId() {
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await goApp.auth.me();
            if (user) {
                // In a real app we'd fetch the driver profile properly
                // Since this is a demo, we might need to filter or get from local state
                const drivers = await goApp.entities.Driver.filter({ email: user.email });
                if (drivers && drivers.length > 0) {
                    setDriver(drivers[0]);
                }
            }

            // Load agreements
            const agreementsData = await goApp.entities.Marketing.Agreements.list();
            setAgreements(agreementsData.filter(a => a.is_active));
        } catch (error) {
            console.error("Error loading ID data:", error);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4B1]"></div>
        </div>;
    }

    if (!driver) {
        return <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
            <p className="mb-4">No se encontró perfil de conductor.</p>
            <Button onClick={() => navigate('/driver/home')}>Volver</Button>
        </div>;
    }

    // QR Data - Simple JSON with Driver ID
    const qrData = JSON.stringify({
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        plate: driver.vehicle_plate,
        type: 'driver_id_card'
    });

    // URL real de validación (apunta a tu dominio local o prod)
    // URL real de validación (apunta a tu dominio local o prod)
    // En producción cambiar window.location.origin por 'https://tudominio.com'
    const verificationUrl = `https://go-codes-gamma.vercel.app/verify/driver/${driver.id}`;

    // Generar QR de alto contraste (Negro sobre Blanco) para máxima legibilidad
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=FFFFFF&margin=1`;

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate('/driver/home')}
                >
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-xl font-bold">Credencial Digital</h1>
            </div>

            <div className="pt-24 px-6 space-y-8">
                {/* Realistic Digital ID Card */}
                <div className="relative w-full aspect-[1.586] perspective-1000 group cursor-pointer">
                    <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180">
                        {/* FRONT OF CARD */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1A1A1A]">
                            {/* Background Texture */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0A0A0A] to-[#1A1A1A]" />

                            {/* Holographic Element */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                                {/* Header: Logo & Verified Badge */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 border-2 border-[#FFD700] rounded-full flex items-center justify-center bg-black">
                                            <span className="font-black text-[#FFD700] text-sm">GO</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm leading-none">GO DRIVER</h3>
                                            <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">Official Credential</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[#FFD700]/10 border border-[#FFD700]/30 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
                                        <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">Verificado</span>
                                    </div>
                                </div>

                                {/* Main Content: Photo & Details */}
                                <div className="flex gap-6 items-end relative z-10">
                                    {/* Photo - Enlarged */}
                                    <div className="w-32 h-40 bg-[#111] rounded-xl border-2 border-white/10 overflow-hidden relative shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        {driver.avatar_url ? (
                                            <img src={driver.avatar_url} alt="Driver" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#222]">
                                                <User size={40} className="text-gray-500" />
                                            </div>
                                        )}
                                        {/* Watermark */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Escudo_de_Paraguay.svg/1200px-Escudo_de_Paraguay.svg.png')] bg-center bg-contain bg-no-repeat mix-blend-overlay" />
                                    </div>

                                    {/* Text Details */}
                                    <div className="flex-1 space-y-4 pb-2">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Nombre del Conductor</p>
                                            <h2 className="text-2xl font-black text-white leading-none tracking-tight truncate">{driver.first_name}</h2>
                                            <h2 className="text-2xl font-black text-white leading-none tracking-tight truncate">{driver.last_name}</h2>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Categoría</p>
                                            <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1 rounded-full">
                                                <Star size={12} className="fill-[#FFD700] text-[#FFD700]" />
                                                <span className="text-[#FFD700] font-bold text-xs">{driver.level || 'BRONCE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2 mb-1">
                                    <div>
                                        <p className="text-[9px] text-gray-600 mb-0.5">DRIVER ID</p>
                                        <p className="font-mono text-gray-300 text-sm tracking-widest">{driver.id.split('-')[0].toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BACK OF CARD (QR + Ficha Técnica) */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#121212]">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            <div className="relative z-10 w-full h-full p-6 flex flex-row items-center gap-6">

                                {/* Left: Extra Large QR */}
                                <div className="flex flex-col items-center justify-center w-2/5 border-r border-white/10 pr-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-[#FFD700]/20 mb-3">
                                        <img src={qrUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center font-mono">Escanear para validar</p>
                                </div>

                                {/* Right: Ficha Técnica */}
                                <div className="flex-1 h-full flex flex-col justify-center">
                                    <h3 className="text-[#FFD700] font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                                        <Car size={16} /> Ficha Técnica
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="bg-white/5 rounded-lg p-2.5 flex justify-between items-center border border-white/5">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Vehículo</span>
                                            <span className="text-white font-bold text-sm text-right">{driver.vehicle_model}</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 flex justify-between items-center border border-white/5">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Marca</span>
                                            <span className="text-white font-bold text-sm text-right">{driver.vehicle_brand || driver.vehicle_make}</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2.5 flex justify-between items-center border border-white/5">
                                            <span className="text-gray-500 text-xs font-bold uppercase">Color</span>
                                            <span className="text-white font-bold text-sm text-right">{driver.vehicle_color || 'No especificado'}</span>
                                        </div>
                                        <div className="bg-[#FFD700]/10 rounded-lg p-2.5 flex justify-between items-center border border-[#FFD700]/30">
                                            <span className="text-[#FFD700] text-xs font-bold uppercase">Placa (Chapa)</span>
                                            <span className="text-[#FFD700] font-mono font-black text-lg text-right tracking-wider">{driver.vehicle_plate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-4 flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">ℹ️</span>
                    Toca la tarjeta para ver el código QR
                </p>

                {/* Benefits / Agreements List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Star className="text-[#00D4B1]" size={20} />
                        Descuentos Activos
                    </h3>

                    <div className="space-y-3">
                        {agreements.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No hay convenios activos en este momento.</p>
                        ) : (
                            agreements.map((agreement) => (
                                <div key={agreement.id} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-[#00D4B1]/30 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-[#252538] flex items-center justify-center text-2xl">
                                        {agreement.logo || '🏷️'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white">{agreement.name}</h4>
                                        <p className="text-xs text-gray-400">Válido hasta: {agreement.expires_at}</p>
                                    </div>
                                    <div className="bg-[#00D4B1]/10 px-3 py-1 rounded-lg">
                                        <span className="text-[#00D4B1] font-bold">{agreement.discount}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-600 px-8">
                    Presenta este código QR en las estaciones adheridas para acceder a los beneficios.
                </p>
            </div>
        </div>
    );
}
