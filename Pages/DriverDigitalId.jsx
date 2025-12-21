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

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=00D4B1&bgcolor=000000`;

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
                {/* Digital ID Card */}
                <div className="relative group">
                    {/* Animated Glow Border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4B1] to-[#008FFB] rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                    <Card className="relative bg-[#0A0A0A] border-0 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00D4B1]/20 to-transparent"></div>

                        <CardContent className="p-6 flex flex-col items-center relative z-10">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full border-4 border-[#0A0A0A] bg-[#252538] flex items-center justify-center mb-4 shadow-xl">
                                <User size={40} className="text-[#00D4B1]" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-1">
                                {driver.first_name} {driver.last_name}
                            </h2>
                            <p className="text-gray-400 mb-6 flex items-center gap-2">
                                <Car size={16} />
                                {driver.vehicle_plate} • {driver.vehicle_make}
                            </p>

                            {/* QR Code */}
                            <div className="bg-white p-2 rounded-xl mb-6">
                                <img src={qrUrl} alt="Driver QR" className="w-48 h-48 rounded" />
                            </div>

                            <div className="flex gap-2 mb-2">
                                <Badge className="bg-[#00D4B1] text-black hover:bg-[#00D4B1]">CONDUCTOR VERIFICADO</Badge>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">ID: {driver.id}</p>
                        </CardContent>
                    </Card>
                </div>

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
