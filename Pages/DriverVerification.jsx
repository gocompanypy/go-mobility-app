import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { goApp } from '@/api/goAppClient';
import { CheckCircle, XCircle, ShieldCheck, Car, Star } from 'lucide-react';

export default function DriverVerification() {
    const { id } = useParams();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        try {
            const data = await goApp.entities.Driver.getPublicProfile(id);
            if (data) {
                setDriver(data);
            } else {
                setError("Conductor no encontrado");
            }
        } catch (err) {
            console.error(err);
            setError("Error al verificar credencial");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 animate-pulse">Verificando en Blockchain...</p>
        </div>
    );

    if (error || !driver) return (
        <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-6 text-center text-white">
            <XCircle size={64} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Credencial No Válida</h1>
            <p className="text-gray-500">No hemos podido encontrar un conductor activo con este identificador.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000] text-white p-6 flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#00D4B1]/20 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#00D4B1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md bg-[#111] border border-[#00D4B1]/30 rounded-3xl p-8 shadow-2xl mt-10 text-center">

                {/* Status Badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00D4B1] text-black font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <ShieldCheck size={20} />
                    Verificado
                </div>

                {/* Driver Photo */}
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#00D4B1] p-1 mb-6 relative">
                    <img
                        src={driver.avatar_url || 'https://via.placeholder.com/150'}
                        alt="Conductor"
                        className="w-full h-full rounded-full object-cover bg-gray-800"
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-[#111] rounded-full" />
                </div>

                <h1 className="text-2xl font-black text-white mb-2">
                    {driver.first_name} {driver.last_name}
                </h1>

                <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="bg-[#FFD700]/10 text-[#FFD700] px-3 py-1 rounded-full text-xs font-bold border border-[#FFD700]/20 flex items-center gap-1">
                        <Star size={12} className="fill-[#FFD700]" />
                        {driver.level || 'BRONCE'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">{driver.trip_count || 0} Viajes</span>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left space-y-4">
                    <h3 className="text-[#00D4B1] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Car size={16} /> Vehículo Autorizado
                    </h3>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Modelo</span>
                        <span className="font-bold">{driver.vehicle_brand} {driver.vehicle_model}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Color</span>
                        <span className="font-bold capitalize">{driver.vehicle_color}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-400 text-sm">Matrícula</span>
                        <div className="bg-white text-black px-2 py-1 rounded text-sm font-mono font-bold">
                            {driver.vehicle_plate}
                        </div>
                    </div>
                </div>

                <p className="text-gray-500 text-xs mt-8">
                    Este conductor ha cumplido con todos los requisitos de seguridad y verificación de identidad de GO App.
                </p>
                <div className="mt-2 text-[10px] text-gray-700 font-mono">
                    ID: {driver.id}
                </div>
            </div>

            <div className="mt-8 text-white/20 font-black text-xl tracking-[1em]">GOAPP</div>
        </div>
    );
}
