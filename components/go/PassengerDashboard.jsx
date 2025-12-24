import React from 'react';
import { Car, Calendar, Bike, Package, Search, MapPin, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PassengerDashboard({ user, onSelectService, onSearchClick }) {
    const services = [
        {
            id: 'ride',
            title: 'Viajes',
            icon: Car,
            gradient: 'from-[#FFD700] to-[#FFA500]',
            iconColor: 'text-black',
            shadow: 'shadow-[0_10px_30px_rgba(255,215,0,0.3)]',
            colSpan: 'col-span-1'
        },
        {
            id: 'moto',
            title: 'Moto',
            icon: Bike,
            gradient: 'from-[#00D4B1] to-[#00A388]',
            iconColor: 'text-white',
            shadow: 'shadow-[0_10px_30px_rgba(0,212,177,0.3)]',
            colSpan: 'col-span-1'
        },
        {
            id: 'reserve',
            title: 'Reservas',
            icon: Calendar,
            gradient: 'from-[#2D2D44] to-[#1A1A2E]',
            iconColor: 'text-white',
            shadow: 'shadow-[0_10px_30px_rgba(45,45,68,0.3)]',
            colSpan: 'col-span-1'
        },
        {
            id: 'package',
            title: 'Envíos',
            icon: Package,
            gradient: 'from-[#FF8C00] to-[#FF5500]',
            iconColor: 'text-white',
            shadow: 'shadow-[0_10px_30px_rgba(255,140,0,0.3)]',
            colSpan: 'col-span-1'
        }
    ];

    const recentPlaces = [
        { id: 'home', icon: MapPin, title: 'Casa', address: 'Autopista Ñu Guasú, Asunción' },
        { id: 'work', icon: Clock, title: 'Oficina', address: 'Aviadores del Chaco, Asunción' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex justify-center">
            {/* Ambient Background Glow - Centered */}
            <div className="fixed top-[-10%] left-[50%] translate-x-[-50%] w-[500px] h-[500px] bg-[#FFD700]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Mobile Layout Constraint - Slightly Larger */}
            <div className="w-full max-w-lg h-full flex flex-col overflow-y-auto pb-20 relative z-10 px-6 pt-8">

                {/* Greeting Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 tracking-tight">
                            Hola, {user?.first_name || 'Pasajero'}
                        </h1>
                        <p className="text-gray-400 font-medium text-base">
                            ¿A dónde vamos hoy?
                        </p>
                    </div>
                    {/* Tiny User Avatar/Profile shortcut could go here */}
                </div>

                {/* Main Hero: Search Bar */}
                <div className="mb-10">
                    <button
                        onClick={onSearchClick}
                        className="w-full flex items-center gap-4 bg-[#1A1A1A]/80 backdrop-blur-md p-5 rounded-[24px] border border-white/10 shadow-lg active:scale-[0.98] transition-all duration-300 group hover:border-[#FFD700]/30 hover:bg-[#222]"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center group-hover:bg-[#FFD700] transition-colors duration-300 shadow-inner">
                            <Search size={24} className="text-[#FFD700] group-hover:text-black transition-colors" />
                        </div>
                        <div className="text-left flex-1">
                            <span className="block text-xl font-bold text-white mb-0.5">¿A dónde vas?</span>
                        </div>
                        <div className="bg-[#2A2A2A] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 group-hover:bg-[#333] transition-colors">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-300">Más tarde</span>
                        </div>
                    </button>
                </div>

                {/* Services Grid - Compact & Premium */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {services.map((service) => (
                        <Card
                            key={service.id}
                            className={`
                                relative overflow-hidden border-0 rounded-3xl cursor-pointer transition-all duration-300
                                hover:scale-[1.02] active:scale-[0.98] group ${service.colSpan}
                                h-32 shadow-lg
                            `}
                            onClick={() => onSelectService(service.id)}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-90`} />

                            {/* Content */}
                            <div className="relative h-full flex flex-col items-center justify-center p-4 text-center z-10">
                                <div className={`mb-2 transform group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md ${service.iconColor}`}>
                                    <service.icon size={36} strokeWidth={2} />
                                </div>
                                <h3 className={`font-bold text-base tracking-wide ${service.iconColor}`}>
                                    {service.title}
                                </h3>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Recent Places */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-bold text-white">Recientes</h3>
                        <Button variant="ghost" size="sm" className="text-[#FFD700] text-xs font-bold hover:bg-[#FFD700]/10 h-8 rounded-full">
                            Ver todo
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {recentPlaces.map(place => (
                            <div
                                key={place.id}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1A1A]/50 border border-white/5 hover:bg-[#222] active:bg-[#252525] transition-all cursor-pointer group"
                                onClick={() => onSearchClick()}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center text-gray-400 group-hover:bg-[#FFD700] group-hover:text-black transition-colors duration-300">
                                    <place.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-base">{place.title}</h4>
                                    <p className="text-sm text-gray-400">{place.address}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
}
