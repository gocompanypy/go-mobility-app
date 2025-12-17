import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Car, User, Settings, ArrowRight, Zap, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/go/Logo';

export default function Home() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Zap,
            title: 'Ultra Rápido',
            description: 'Matching de conductores en segundos',
        },
        {
            icon: Shield,
            title: 'Seguro',
            description: 'Conductores verificados y viajes rastreados',
        },
        {
            icon: Clock,
            title: '24/7',
            description: 'Disponible cuando lo necesites',
        },
        {
            icon: Star,
            title: 'Mejor Precio',
            description: 'Tarifas transparentes y competitivas',
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #FFD700 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #FFD700 0%, transparent 50%)`,
                    }} />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-16">
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <Logo size="xl" className="justify-center mb-6" />
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Tu viaje, <span className="gold-shimmer">tu manera</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            La plataforma de movilidad más rápida y segura.
                            Pide un viaje en segundos o conduce y gana dinero.
                        </p>
                    </div>

                    {/* CTA Cards */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Passenger Card */}
                        <button
                            onClick={() => navigate(createPageUrl('PassengerWelcome'))}
                            className="group p-8 rounded-2xl gold-border transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)' }}>
                                <User size={32} className="text-black" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Soy Pasajero</h2>
                            <p className="text-gray-400 mb-6">
                                Pide un viaje y llega a tu destino de forma segura
                            </p>
                            <div className="flex items-center text-[#FFD700] font-medium">
                                Pedir viaje
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>

                        {/* Driver Card */}
                        <button
                            onClick={() => navigate(createPageUrl('DriverWelcome'))}
                            className="group p-8 rounded-2xl gold-border transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)' }}>
                                <Car size={32} className="text-black" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Soy Conductor</h2>
                            <p className="text-gray-400 mb-6">
                                Conduce con GO y genera ingresos flexibles
                            </p>
                            <div className="flex items-center text-[#FFD700] font-medium">
                                Comenzar a conducir
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>

                        {/* Admin Card */}
                        <button
                            onClick={() => navigate(createPageUrl('AdminDashboard'))}
                            className="group p-8 rounded-2xl gold-border transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)' }}>
                                <Settings size={32} className="text-black" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Administración</h2>
                            <p className="text-gray-400 mb-6">
                                Panel de control para gestionar la plataforma
                            </p>
                            <div className="flex items-center text-[#FFD700] font-medium">
                                Ir al panel
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-[#0A0A0A] py-16 border-y border-[#FFD700]/20">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        ¿Por qué elegir <span className="gold-shimmer">GO</span>?
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)' }}>
                                        <Icon size={28} className="text-black" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-5xl font-bold mb-2 gold-shimmer">10K+</p>
                            <p className="text-gray-400">Viajes completados</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold mb-2 gold-shimmer">500+</p>
                            <p className="text-gray-400">Conductores activos</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold mb-2 gold-shimmer">4.9</p>
                            <p className="text-gray-400">Calificación promedio</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#0A0A0A] border-t-2 border-[#FFD700]/20 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <Logo size="sm" />
                        <p className="text-gray-400 text-sm">
                            © 2024 GO Mobility. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Términos
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Privacidad
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Soporte
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
