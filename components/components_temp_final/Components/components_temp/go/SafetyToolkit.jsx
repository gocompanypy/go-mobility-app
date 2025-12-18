import React, { useState } from 'react';
import { Shield, Phone, Share2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

export default function SafetyToolkit({ className = '' }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleEmergencyCall = () => {
        window.location.href = 'tel:911';
        toast.info('Iniciando llamada de emergencia...');
        setIsOpen(false);
    };

    const handleShareTrip = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Sigue mi viaje en GO',
                text: 'Estoy en un viaje con GO. Sigue mi ubicación aquí:',
                url: window.location.href,
            })
                .then(() => toast.success('Ubicación compartida'))
                .catch((error) => console.log('Error compartiendo', error));
        } else {
            // Fallback for desktop or unsupported browsers
            navigator.clipboard.writeText(window.location.href);
            toast.success('Enlace de viaje copiado al portapapeles');
        }
        setIsOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 ${className}`}
                >
                    <Shield size={24} fill="currentColor" className="opacity-20 absolute" />
                    <Shield size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-[#1A1A2E] border-t border-[#2D2D44] rounded-t-3xl p-6 pb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="text-blue-500" />
                        Centro de Seguridad
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="text-gray-400" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-start gap-3 h-auto p-4 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        onClick={handleEmergencyCall}
                    >
                        <div className="bg-red-500/20 p-2 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Llamada de emergencia</p>
                            <p className="text-xs opacity-80">Llamar al 911 ahora</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-start gap-3 h-auto p-4 border-[#2D2D44] bg-[#252538] hover:bg-[#2D2D44]"
                        onClick={handleShareTrip}
                    >
                        <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                            <Share2 size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Compartir mi viaje</p>
                            <p className="text-xs text-gray-400">Enviar ubicación a contactos de confianza</p>
                        </div>
                    </Button>

                    <div className="mt-6 p-4 bg-blue-900/10 rounded-xl border border-blue-500/20">
                        <p className="text-sm text-blue-200">
                            <strong>Tu seguridad es nuestra prioridad.</strong> Si te sientes inseguro, usa el botón de emergencia o comparte tu viaje inmediatamente.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
