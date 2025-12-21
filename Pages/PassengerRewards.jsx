import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Gift, Star, Crown, Zap, Award, ChevronRight, Lock, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PassengerRewards() {
    const navigate = useNavigate();
    const [reward, setReward] = useState(null);
    const [passenger, setPassenger] = useState(null);

    const tiers = {
        bronze: {
            name: 'Bronce',
            color: '#CD7F32',
            bgGradient: 'from-[#CD7F32] to-[#8B5A2B]',
            icon: Award,
            required: 0,
            perks: ['Acceso básico']
        },
        silver: {
            name: 'Plata',
            color: '#E0E0E0',
            bgGradient: 'from-[#E0E0E0] to-[#757575]',
            icon: Star,
            required: 100,
            perks: ['Soporte preferencial', '+5% en puntos']
        },
        gold: {
            name: 'Oro',
            color: '#FFD700',
            bgGradient: 'from-[#FFD700] to-[#DAA520]',
            icon: Crown,
            required: 500,
            perks: ['Sin tarifa de espera', '+10% en puntos', 'Autos más nuevos']
        },
        platinum: {
            name: 'Platino',
            color: '#E5E4E2',
            bgGradient: 'from-[#E5E4E2] to-[#4A4A4A]',
            icon: Zap,
            required: 1000,
            perks: ['Atención 24/7 VIP', '+20% en puntos', 'Regalos mensuales']
        },
        diamond: {
            name: 'Diamante',
            color: '#B9F2FF',
            bgGradient: 'from-[#00D4B1] to-[#008F7A]',
            icon: Gift,
            required: 2500,
            perks: ['Viajes gratis', 'Concierge personal', 'Eventos exclusivos']
        },
    };

    useEffect(() => {
        loadRewardData();
    }, []);

    const loadRewardData = async () => {
        try {
            const user = await goApp.auth.me();
            const passengers = await goApp.entities.Passenger.filter({ created_by: user.email });

            if (passengers.length > 0) {
                setPassenger(passengers[0]);
                const rewards = await goApp.entities.GoReward.filter({ passenger_id: passengers[0].id });
                if (rewards.length > 0) {
                    setReward(rewards[0]);
                } else {
                    const newReward = await goApp.entities.GoReward.create({
                        passenger_id: passengers[0].id,
                        points_balance: 0,
                        lifetime_points: 0,
                        tier: 'bronze',
                        points_to_next_tier: 100,
                        benefits: []
                    });
                    setReward(newReward);
                }
            }
        } catch (error) {
            console.error('Error loading rewards:', error);
        }
    };

    const currentTierKey = reward?.tier || 'bronze';
    const currentTierIndex = Object.keys(tiers).indexOf(currentTierKey);
    const nextTierKey = Object.keys(tiers)[currentTierIndex + 1];
    const currentTierData = tiers[currentTierKey];
    const nextTierData = nextTierKey ? tiers[nextTierKey] : null;

    const progress = nextTierData
        ? Math.min(Math.max(((reward?.lifetime_points || 0) / nextTierData.required) * 100, 0), 100)
        : 100;

    const CurrentIcon = currentTierData.icon;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00D4B1] selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-b from-[#FFD700]/10 to-transparent blur-3xl opacity-50" />
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
                    <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#FFD700] to-yellow-200 bg-clip-text text-transparent">
                        GO Rewards
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 pb-24 space-y-8">
                {/* Premium Card: Current Level */}
                <div className="perspective-1000">
                    <div
                        className={`
                            relative w-full aspect-[1.6/1] rounded-3xl p-6 md:p-8 
                            bg-gradient-to-br ${currentTierData.bgGradient}
                            shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-[1.02]
                            flex flex-col justify-between overflow-hidden border border-white/20
                        `}
                    >
                        {/* Card Texture/Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                        {/* Card Top */}
                        <div className="flex justify-between items-start z-10">
                            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                <Crown size={14} className="text-white" />
                                <span className="text-xs font-bold text-white tracking-widest uppercase">Go Member</span>
                            </div>
                            <CurrentIcon size={40} className="text-white drop-shadow-lg" />
                        </div>

                        {/* Card Bottom */}
                        <div className="z-10 text-white">
                            <p className="text-sm font-medium opacity-80 mb-1">Status Actual</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-4 drop-shadow-md">
                                {currentTierData.name}
                            </h2>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">Puntos Totales</p>
                                    <p className="text-2xl font-mono font-bold tracking-wider">{reward?.lifetime_points?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">Balance Disponible</p>
                                    <p className="text-2xl font-mono font-bold tracking-wider">{reward?.points_balance?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Level Progress */}
                {nextTierData && (
                    <div className="bg-[#12121A]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 ring-1 ring-white/5">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    Siguiente Nivel: {nextTierData.name}
                                    <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Te faltan <span className="text-[#00D4B1] font-bold">{nextTierData.required - (reward?.lifetime_points || 0)}</span> puntos
                                </p>
                            </div>
                            <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 bg-[#252538] rounded-full overflow-hidden relative">
                            {/* Animated Progress Bar */}
                            <div
                                className="h-full bg-gradient-to-r from-[#00D4B1] to-[#008F7A] rounded-full relative"
                                style={{ width: `${progress}%`, transition: 'width 1s ease-out' }}
                            >
                                <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[2px]" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions Grid */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#00D4B1]" />
                        Boostea tus puntos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { title: 'Completa un viaje', points: '+10 pts', icon: Gift, color: 'text-[#00D4B1]', bg: 'bg-[#00D4B1]/10' },
                            { title: 'Califica 5 estrellas', points: '+5 pts', icon: Star, color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10' },
                            { title: 'Invita amigos', points: '+50 pts', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        ].map((item, i) => (
                            <button key={i} className="flex items-center gap-4 p-4 bg-[#1A1A2E]/50 border border-white/5 rounded-xl hover:bg-[#1A1A2E] hover:border-white/10 transition-all group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                                    <item.icon size={24} className={item.color} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white group-hover:text-[#00D4B1] transition-colors">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.points}</p>
                                </div>
                                <ChevronRight className="ml-auto text-gray-600 group-hover:text-white transition-colors" size={18} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* All Tiers List */}
                <div className="pt-4">
                    <h3 className="text-lg font-bold text-white mb-4">Beneficios por Nivel</h3>
                    <div className="space-y-3">
                        {Object.entries(tiers).map(([key, tier], index) => {
                            const isCurrent = key === reward?.tier;
                            const isUnlocked = (reward?.lifetime_points || 0) >= tier.required;
                            const TierIcon = tier.icon;

                            return (
                                <div
                                    key={key}
                                    className={`
                                        group relative overflow-hidden rounded-2xl border transition-all duration-300
                                        ${isCurrent
                                            ? 'bg-[#1A1A2E] border-[#00D4B1] shadow-[0_0_20px_-10px_#00D4B1]'
                                            : isUnlocked
                                                ? 'bg-[#12121A]/80 border-white/10 hover:border-white/20'
                                                : 'bg-[#0A0A0E] border-white/5 opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    <div className="p-5 flex items-start gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isUnlocked ? '' : 'grayscale'}`}
                                            style={{ backgroundColor: `${tier.color}20` }}
                                        >
                                            <TierIcon size={24} style={{ color: tier.color }} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-base" style={{ color: isUnlocked ? tier.color : '#9CA3AF' }}>
                                                    {tier.name}
                                                </h4>
                                                {isCurrent && (
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-[#00D4B1] text-black rounded-full uppercase tracking-wide">
                                                        Actual
                                                    </span>
                                                )}
                                                {!isUnlocked && (
                                                    <Lock size={14} className="text-gray-600" />
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500 font-medium mb-3">
                                                {tier.required === 0 ? 'Nivel inicial' : `Requiere ${tier.required.toLocaleString()} puntos`}
                                            </p>

                                            {/* Perks List */}
                                            <ul className="space-y-1">
                                                {tier.perks.map((perk, pIdx) => (
                                                    <li key={pIdx} className="text-xs text-gray-400 flex items-center gap-2">
                                                        <div className={`w-1 h-1 rounded-full ${isUnlocked ? 'bg-white' : 'bg-gray-600'}`} />
                                                        {perk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
