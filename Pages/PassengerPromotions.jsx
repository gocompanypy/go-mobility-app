import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Ticket, Copy, Check, Tag, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PassengerPromotions() {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [copiedCode, setCopiedCode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Código copiado', {
            description: 'Úsalo al confirmar tu próximo viaje',
            icon: <Sparkles className="text-yellow-400" />,
            style: { background: '#1A1A2E', color: 'white', border: '1px solid #333' }
        });
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FFD700] selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#252538] to-transparent opacity-20" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Promociones
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
                {/* Hero Banner */}
                <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] animate-in fade-in zoom-in duration-1000" />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle at 10px 10px, black 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />

                    <div className="relative p-6 py-8 text-black flex items-center justify-between">
                        <div>
                            <Badge className="bg-black/20 hover:bg-black/30 text-black border-0 backdrop-blur-sm mb-3">
                                <Sparkles size={12} className="mr-1" /> Nuevo
                            </Badge>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">¡Viaja y Ahorra!</h2>
                            <p className="font-medium opacity-80 max-w-[250px] leading-snug">
                                Descubre descuentos exclusivos seleccionados especialmente para ti.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Ticket size={64} className="opacity-20 rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Promotions List */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 bg-[#1A1A2E]/50 rounded-2xl animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-[#1A1A2E] rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                <Ticket size={32} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-300">Sin promociones activas</h3>
                            <p className="text-sm text-gray-500 max-w-[200px] mt-2">
                                Estamos preparando nuevos beneficios. ¡Revisa pronto!
                            </p>
                        </div>
                    ) : (
                        promotions.map((promo, idx) => (
                            <div
                                key={promo.id}
                                className="relative group perspective-1000 animate-in slide-in-from-bottom-4 fade-in"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Ticket Container */}
                                <div className="bg-[#12121A] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative flex flex-col md:flex-row">

                                    {/* Left Side (Visual) */}
                                    <div className="md:w-32 bg-gradient-to-br from-[#1A1A2E] to-[#0F0F16] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative">
                                        {/* Perforations (Circles) */}
                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full z-10 hidden md:block" />
                                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full z-10 hidden md:block" />

                                        <span className="text-3xl font-black text-[#FFD700] tracking-tighter">
                                            {promo.discount_percentage}%
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">OFF</span>
                                    </div>

                                    {/* Right Side (Content) */}
                                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-[#FFD700] transition-colors">
                                                    {promo.title}
                                                </h3>
                                                {promo.target_audience === 'new_users' && (
                                                    <Badge className="bg-[#00D4B1]/10 text-[#00D4B1] hover:bg-[#00D4B1]/20 border-0 text-[10px]">
                                                        Nuevos
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                                {promo.description}
                                            </p>
                                        </div>

                                        {/* Code & Action */}
                                        <div className="bg-[#1A1A2E] rounded-xl p-1.5 pl-4 flex items-center justify-between border border-dashed border-gray-700/50 hover:border-[#FFD700]/50 transition-colors">
                                            <code className="font-mono font-bold text-[#FFD700] tracking-wider text-sm md:text-base">
                                                {promo.promo_code}
                                            </code>
                                            <Button
                                                onClick={() => copyCode(promo.promo_code)}
                                                size="sm"
                                                className={`
                                                    rounded-lg h-9 transition-all duration-300
                                                    ${copiedCode === promo.promo_code
                                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                        : 'bg-[#FFD700] text-black hover:bg-[#FFA500] hover:shadow-lg hover:shadow-[#FFD700]/20'}
                                                `}
                                            >
                                                {copiedCode === promo.promo_code ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <>
                                                        <span className="text-xs font-bold mr-1 hidden md:inline">COPIAR</span>
                                                        <Copy size={14} />
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Footer Micro-copy */}
                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-gray-500">
                                            {promo.valid_until && (
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle size={10} />
                                                    Expira el {format(new Date(promo.valid_until), "d MMM", { locale: es })}
                                                </span>
                                            )}
                                            {promo.min_trip_amount > 0 && (
                                                <span>• Min. Gs. {promo.min_trip_amount.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-12 bg-[#12121A]/50 rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#FFD700] rounded-full" />
                        ¿Cómo canjear tu cupón?
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            { step: 1, text: 'Copia el código del cupón que prefieras' },
                            { step: 2, text: 'Selecciona tu destino y vehículo' },
                            { step: 3, text: 'Pega el código en "Añadir Promo" antes de pedir' },
                            { step: 4, text: '¡Listo! Tu descuento se aplica automáticamente' }
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-3 text-sm text-gray-400">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A1A2E] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#FFD700]">
                                    {item.step}
                                </span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
