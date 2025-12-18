import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Zap, Clock, Shield, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/go/Logo';

export default function PassengerWelcome() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Zap,
            title: 'Viajes rápidos',
            description: 'Encuentra conductores cerca en segundos'
        },
        {
            icon: DollarSign,
            title: 'Precios justos',
            description: 'Tarifas transparentes desde el inicio'
        },
        {
            icon: Shield,
            title: 'Seguridad total',
            description: 'Conductores verificados y viaje monitoreado'
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FFA500]/10 rounded-full blur-[120px]" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-md mx-auto pt-12">
                <div className="relative mb-10 animate-in fade-in zoom-in duration-700">
                    <div className="absolute inset-0 bg-[#FFD700] blur-2xl opacity-20 rounded-full animate-pulse" />
                    <Logo size="xl" className="relative drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
                </div>

                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-[#FFD700] to-[#FFA500] bg-clip-text text-transparent inline-block">
                        GO Pasajero
                    </h1>
                    <p className="text-gray-400 text-lg">Tu viaje, tu tiempo, tu seguridad.</p>
                </div>

                {/* Features Cards */}
                <div className="space-y-4 w-full mb-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-5 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group hover:border-[#FFD700]/30 hover:scale-[1.02]"
                                style={{ animationDelay: `${200 + index * 100}ms` }}
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow duration-300"
                                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                                >
                                    <Icon size={24} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-0.5 group-hover:text-[#FFD700] transition-colors">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-snug">{feature.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 pb-12 pt-4 relative z-10 w-full max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <Button
                    onClick={() => navigate(createPageUrl('PassengerSignup'))}
                    className="w-full py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
                    }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Crear cuenta
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>

                <Button
                    onClick={() => navigate(createPageUrl('PassengerLogin'))}
                    variant="ghost"
                    className="w-full py-7 text-[#FFD700] hover:text-[#FFA500] hover:bg-[#FFD700]/10 font-semibold text-lg border border-[#FFD700]/30 rounded-xl transition-all duration-300"
                >
                    Iniciar sesión
                </Button>
            </div>
        </div>
    );
}
