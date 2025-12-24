import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goApp } from '@/api/goAppClient';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, User, MapPin, Save, Camera, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PassengerProfile() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        homeAddress: '',
        workAddress: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await goApp.auth.me();
            // In a real app, we'd fetch the specific Passenger entity here
            // For now, we simulate with user data and local state mock
            setProfile({
                firstName: user.full_name?.split(' ')[0] || '',
                lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.phone || '0981 123 456', // Mock fallback
                homeAddress: 'Av. España 1234',
                workAddress: 'World Trade Center, Asunción'
            });
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success('Perfil actualizado correctamente');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20 gold-glow">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-white hover:bg-[#252538]"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-xl font-bold">Mi Perfil</h1>
                </div>
            </header>

            <main className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Photo Section */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center border-4 border-black shadow-xl">
                            <User size={40} className="text-black" />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-[#FFD700] p-2 rounded-full text-black hover:bg-[#FFA500] transition-colors shadow-lg shadow-[#FFD700]/20">
                            <Camera size={16} />
                        </button>
                    </div>
                    <h2 className="mt-4 text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
                    <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-[#252538] rounded-full border border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                        <span className="text-[#FFD700] font-bold">4.9</span>
                        <div className="flex gap-0.5">
                            <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                            <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                            <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                            <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                            <Star size={14} className="fill-[#FFD700] text-[#FFD700]" />
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2">{profile.email}</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Personal Info */}
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-[#FFD700] flex items-center gap-2">
                                <User size={18} /> Información Personal
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={profile.firstName}
                                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                        className="bg-[#0A0A0A] border-[#2D2D44]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido</Label>
                                    <Input
                                        value={profile.lastName}
                                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                        className="bg-[#0A0A0A] border-[#2D2D44]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="bg-[#0A0A0A] border-[#2D2D44]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Saved Places */}
                    <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-[#FFD700] flex items-center gap-2">
                                <MapPin size={18} /> Lugares Guardados
                            </h3>
                            <div className="space-y-2">
                                <Label>Casa</Label>
                                <Input
                                    value={profile.homeAddress}
                                    onChange={e => setProfile({ ...profile, homeAddress: e.target.value })}
                                    className="bg-[#0A0A0A] border-[#2D2D44]"
                                    placeholder="Agregar dirección de casa"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trabajo</Label>
                                <Input
                                    value={profile.workAddress}
                                    onChange={e => setProfile({ ...profile, workAddress: e.target.value })}
                                    className="bg-[#0A0A0A] border-[#2D2D44]"
                                    placeholder="Agregar dirección de trabajo"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-black font-bold h-12"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </form>
            </main>
        </div>
    );
}
