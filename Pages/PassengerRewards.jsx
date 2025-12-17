import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Gift, Star, Crown, Zap, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Logo from '@/components/go/Logo';

export default function PassengerRewards() {
    const navigate = useNavigate();
    const [reward, setReward] = useState(null);
    const [passenger, setPassenger] = useState(null);

    const tiers = {
        bronze: { name: 'Bronce', color: '#CD7F32', icon: Award, required: 0 },
        silver: { name: 'Plata', color: '#C0C0C0', icon: Star, required: 100 },
        gold: { name: 'Oro', color: '#FFD700', icon: Crown, required: 500 },
        platinum: { name: 'Platino', color: '#E5E4E2', icon: Zap, required: 1000 },
        diamond: { name: 'Diamante', color: '#B9F2FF', icon: Gift, required: 2500 },
    };

    useEffect(() => {
        loadRewardData();
    }, []);

    const loadRewardData = async () => {
        try {
            const user = await base44.auth.me();
            const passengers = await base44.entities.Passenger.filter({ created_by: user.email });

            if (passengers.length > 0) {
                setPassenger(passengers[0]);

                const rewards = await base44.entities.GoReward.filter({ passenger_id: passengers[0].id });
                if (rewards.length > 0) {
                    setReward(rewards[0]);
                } else {
                    const newReward = await base44.entities.GoReward.create({
                        passenger_id: passengers[0].id,
                        points_balance: 0,
                        lifetime_points: 0,
                        tier: 'bronze',
                        points_to_next_tier: 100,
                        benefits: [
                            { name: 'Soporte prioritario', description: 'Atención al cliente premium', active: false },
                            { name: 'Descuentos exclusivos', description: 'Hasta 20% en viajes', active: false },
                        ]
                    });
                    setReward(newReward);
                }
            }
        } catch (error) {
            console.error('Error loading rewards:', error);
        }
    };

    const currentTierIndex = Object.keys(tiers).indexOf(reward?.tier || 'bronze');
    const nextTierKey = Object.keys(tiers)[currentTierIndex + 1];
    const currentTierData = tiers[reward?.tier || 'bronze'];
    const nextTierData = nextTierKey ? tiers[nextTierKey] : null;

    const progress = nextTierData
        ? ((reward?.lifetime_points || 0) / nextTierData.required) * 100
        : 100;

    const CurrentIcon = currentTierData.icon;

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
                    <h1 className="text-xl font-bold">GO Rewards</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="p-6 pb-20">
                {/* Tier Card */}
                <Card
                    className="border-2 mb-6 overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${currentTierData.color}15 0%, #1A1A2E 100%)`,
                        borderColor: currentTierData.color
                    }}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: `${currentTierData.color}30` }}
                                >
                                    <CurrentIcon size={32} style={{ color: currentTierData.color }} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Tu nivel</p>
                                    <h2 className="text-2xl font-bold" style={{ color: currentTierData.color }}>
                                        {currentTierData.name}
                                    </h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-[#FFD700]">
                                    {reward?.points_balance || 0}
                                </p>
                                <p className="text-xs text-gray-400">Puntos</p>
                            </div>
                        </div>

                        {nextTierData && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Progreso a {nextTierData.name}</span>
                                        <span className="text-white font-medium">
                                            {reward?.lifetime_points || 0} / {nextTierData.required}
                                        </span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Te faltan {nextTierData.required - (reward?.lifetime_points || 0)} puntos
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Cómo ganar puntos */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Gana puntos</h3>
                    <div className="space-y-3">
                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#00D4B1]/20 rounded-lg flex items-center justify-center">
                                        <Gift size={20} className="text-[#00D4B1]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Completa un viaje</p>
                                        <p className="text-sm text-gray-400">10 puntos por viaje</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </CardContent>
                        </Card>

                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#FFD700]/20 rounded-lg flex items-center justify-center">
                                        <Star size={20} className="text-[#FFD700]" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Califica 5 estrellas</p>
                                        <p className="text-sm text-gray-400">5 puntos extra</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </CardContent>
                        </Card>

                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Gift size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Recomienda a un amigo</p>
                                        <p className="text-sm text-gray-400">50 puntos de bonus</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Todos los niveles */}
                <div>
                    <h3 className="font-semibold text-lg mb-4">Todos los niveles</h3>
                    <div className="space-y-3">
                        {Object.entries(tiers).map(([key, tier], index) => {
                            const TierIcon = tier.icon;
                            const isCurrent = key === reward?.tier;
                            const isUnlocked = (reward?.lifetime_points || 0) >= tier.required;

                            return (
                                <Card
                                    key={key}
                                    className={`border ${isCurrent ? 'border-2' : 'border'}`}
                                    style={{
                                        borderColor: isCurrent ? tier.color : '#2D2D44',
                                        backgroundColor: isUnlocked ? `${tier.color}10` : '#1A1A2E'
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${tier.color}30` }}
                                            >
                                                <TierIcon size={24} style={{ color: tier.color }} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold" style={{ color: isUnlocked ? tier.color : 'white' }}>
                                                        {tier.name}
                                                    </h4>
                                                    {isCurrent && (
                                                        <span className="text-xs px-2 py-0.5 bg-[#00D4B1] text-black rounded-full font-medium">
                                                            Actual
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {tier.required === 0 ? 'Nivel inicial' : `${tier.required} puntos`}
                                                </p>
                                            </div>
                                            {isUnlocked && (
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
