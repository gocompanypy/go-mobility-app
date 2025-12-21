import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { goApp } from '@/api/goAppClient';
import { toast } from 'sonner';

export default function DriverLogin() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user, profile } = await goApp.auth.login(phone, password);
            toast.success(`¡Bienvenido de nuevo, ${profile?.first_name || 'Conductor'}! 👋`);
            navigate(createPageUrl('DriverHome'));
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FFA500]/5 rounded-full blur-[100px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors z-20 backdrop-blur-sm group"
            >
                <ArrowLeft size={24} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Main Card */}
            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-50" />

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-[#FFD700] to-[#FFA500] bg-clip-text text-transparent inline-block">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-gray-400 text-sm">Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5 group">
                            <Label htmlFor="phone" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Número de teléfono
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'phone' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone size={20} className={`transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="0981 123 456"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            setPhone(val);
                                        }
                                    }}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    pattern="09[0-9]{8}"
                                    title="Debe ser un número local que empiece con 09 y tenga 10 dígitos"
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-lg placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wide"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 group">
                            <Label htmlFor="password" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Contraseña
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'password' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone size={20} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                    {/* Icon reuse for now, ideally Lock icon */}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-lg placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wide"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-7 text-black font-bold text-lg rounded-xl mt-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Iniciar Sesión
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">¿No tienes una cuenta?</p>
                            <button
                                type="button"
                                onClick={() => navigate(createPageUrl('DriverSignup'))}
                                className="text-[#FFD700] hover:text-[#FFA500] font-medium text-sm mt-1 transition-colors hover:underline"
                            >
                                Regístrate como conductor
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} GO Logistics. App versión 1.0.0
                </p>
            </div>
        </div>
    );
}
