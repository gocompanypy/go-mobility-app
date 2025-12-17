import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { FileCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DriverSuccess() {
    const navigate = useNavigate();

    const nextSteps = [
        'Descarga la app móvil de GO Conductor',
        'Revisa los requisitos del vehículo',
        'Lee las políticas de servicio'
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
            {/* Success Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] blur-3xl opacity-30 rounded-full" />
                <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                >
                    <FileCheck size={48} className="text-black" />
                </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl font-bold text-center mb-4">
                ¡Documentos enviados!
            </h1>
            <p className="text-gray-400 text-center mb-12 max-w-md">
                Estamos revisando tu información. Te notificaremos cuando tu cuenta esté aprobada (normalmente en 24-48 horas).
            </p>

            {/* Next Steps */}
            <div className="w-full max-w-md mb-12">
                <p className="text-lg font-semibold mb-4">Mientras tanto...</p>
                <div className="space-y-3">
                    {nextSteps.map((step, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-4 rounded-xl border border-[#FFD700]/20"
                            style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                            >
                                <Check size={14} className="text-black font-bold" />
                            </div>
                            <p className="text-gray-300">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-md space-y-3">
                <Button
                    onClick={() => navigate(createPageUrl('DriverHome'))}
                    className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                >
                    Ir al dashboard (Demo)
                </Button>

                <Button
                    onClick={() => navigate(createPageUrl('Home'))}
                    variant="outline"
                    className="w-full py-6 text-white font-semibold text-lg border-2 border-[#FFD700]/30 hover:bg-[#FFD700]/10"
                >
                    Volver al inicio
                </Button>
            </div>
        </div>
    );
}
