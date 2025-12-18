import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Ticket, Copy, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PassengerPromotions() {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const data = await goApp.entities.ActivePromotion.filter({ is_active: true });
            setPromotions(data);
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Código copiado');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b-2 border-[#FFD700]/20 gold-glow" style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.15)' }}>
                <div className="flex items-center justify-between px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-white"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-xl font-bold">Promociones</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="p-6">
                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl p-6 mb-6 text-black">
                    <div className="flex items-center gap-3 mb-2">
                        <Tag size={24} />
                        <h2 className="text-2xl font-bold">¡Ahorra en cada viaje!</h2>
                    </div>
                    <p className="text-sm opacity-90">
                        Usa estos códigos promocionales para obtener descuentos exclusivos
                    </p>
                </div>

                {/* Active Promotions */}
                <div className="space-y-4">
                    {promotions.length === 0 ? (
                        <div className="text-center py-12">
                            <Ticket size={48} className="mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-400">No hay promociones disponibles</p>
                        </div>
                    ) : (
                        promotions.map((promo) => (
                            <Card
                                key={promo.id}
                                className="bg-gradient-to-br from-[#1A1A2E] to-[#252538] border-[#2D2D44] overflow-hidden"
                            >
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Badge className="bg-[#FFD700] text-black mb-2">
                                                    {promo.discount_percentage}% OFF
                                                </Badge>
                                                <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                                                <p className="text-sm text-gray-400">{promo.description}</p>
                                            </div>
                                        </div>

                                        {/* Código promocional */}
                                        <div className="bg-[#0F0F1A] border-2 border-dashed border-[#FFD700]/30 rounded-xl p-4 mb-4">
                                            <p className="text-xs text-gray-400 mb-2">Código promocional</p>
                                            <div className="flex items-center justify-between">
                                                <code className="text-2xl font-bold text-[#FFD700] tracking-widest">
                                                    {promo.promo_code}
                                                </code>
                                                <Button
                                                    onClick={() => copyCode(promo.promo_code)}
                                                    size="sm"
                                                    className="bg-[#FFD700] text-black hover:bg-[#FFA500]"
                                                >
                                                    {copiedCode === promo.promo_code ? (
                                                        <>
                                                            <Check size={16} className="mr-2" />
                                                            Copiado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={16} className="mr-2" />
                                                            Copiar
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Detalles */}
                                        <div className="space-y-2 text-sm">
                                            {promo.min_trip_amount > 0 && (
                                                <p className="text-gray-400">
                                                    • Monto mínimo: €{promo.min_trip_amount}
                                                </p>
                                            )}
                                            {promo.valid_until && (
                                                <p className="text-gray-400">
                                                    • Válido hasta: {format(new Date(promo.valid_until), "dd 'de' MMMM", { locale: es })}
                                                </p>
                                            )}
                                            {promo.target_audience !== 'all' && (
                                                <p className="text-gray-400">
                                                    • Exclusivo para: {promo.target_audience === 'new_users' ? 'Nuevos usuarios' : promo.target_audience}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Cómo usar */}
                <Card className="bg-[#1A1A2E] border-[#2D2D44] mt-6">
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">¿Cómo usar un código promocional?</h3>
                        <ol className="space-y-2 text-sm text-gray-400">
                            <li className="flex gap-3">
                                <span className="text-[#FFD700] font-bold">1.</span>
                                Copia el código que desees usar
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#FFD700] font-bold">2.</span>
                                Pide un viaje normalmente
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#FFD700] font-bold">3.</span>
                                Aplica el código antes de confirmar
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#FFD700] font-bold">4.</span>
                                ¡Disfruta tu descuento!
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
