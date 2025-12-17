import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, DollarSign, Smartphone, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/go/Logo';

export default function DriverWelcome() {
    const navigate = useNavigate();

    const benefits = [
        {
            icon: DollarSign,
            title: 'Gana bien',
            description: 'Tú decides cuándo trabajar y cuánto ganar'
        },
        {
            icon: Smartphone,
            title: 'Control total',
            description: 'App intuitiva con navegación integrada'
        },
        {
            icon: TrendingUp,
            title: 'Bonificaciones',
            description: 'Gana extra en zonas de alta demanda'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#252538] to-[#1A1A2E] flex flex-col">
            {/* Header */}
            <header className="p-4">
                <button
                    onClick={() => navigate(createPageUrl('Home'))}
                    className="text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
            </header>

            {/* Logo Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] blur-3xl opacity-30 rounded-full" />
                    <Logo size="xl" className="relative" />
                </div>

                <h1 className="text-4xl font-bold text-center mb-2 gold-shimmer">
                    GO Conductor
                </h1>
                <p className="text-gray-400 text-center mb-12">Gana dinero conduciendo</p>

                {/* Benefits */}
                <div className="space-y-6 w-full max-w-md mb-8">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-xl border border-[#FFD700]/20 gold-glow"
                                style={{ background: 'linear-gradient(135deg, #1A1A2E, #252538)' }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)' }}
                                >
                                    <Icon size={24} className="text-black" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 pb-8 space-y-3">
                <Button
                    onClick={() => navigate(createPageUrl('DriverSignup'))}
                    className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                >
                    Únete como conductor
                </Button>

                <Button
                    onClick={() => navigate(createPageUrl('DriverLogin'))}
                    variant="outline"
                    className="w-full py-6 text-white font-semibold text-lg border-2 border-[#FFD700]/30 hover:bg-[#FFD700]/10"
                >
                    Ya tengo cuenta
                </Button>
            </div>
        </div>
    );
}
