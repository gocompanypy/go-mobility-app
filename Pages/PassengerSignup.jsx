import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, User, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { goApp } from '@/api/goAppClient';
import { toast } from 'sonner';

export default function PassengerSignup() {
    const navigate = useNavigate();
    const location = useLocation();
    const [focusedField, setFocusedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: location.state?.phone || '',
        email: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Registro con Supabase (Auth + DB)
            await goApp.auth.register(formData.phone, formData.password, {
                role: 'passenger',
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email
            });

            toast.success('¡Cuenta creada con éxito! Bienvenido/a 🚕');

            // Delay para feedback visual
            setTimeout(() => {
                navigate(createPageUrl('PassengerHome'));
            }, 1000);

        } catch (error) {
            console.error(error);
            // Supabase returns "User already registered" within the error message for duplicates
            if (error.message.includes('already registered') || error.message.includes('unique constraint')) {
                toast.error('Este número o correo ya está registrado. Por favor, inicia sesión.', {
                    duration: 4000, // Make sure it stays long enough
                });
                // Delay navigation to let the user read the message
                setTimeout(() => {
                    navigate(createPageUrl('PassengerLogin'));
                }, 2500);
            } else {
                toast.error('Error al registrar: ' + (error.message || 'Inténtalo de nuevo.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 -left-20 w-96 h-96 bg-[#FFA500]/10 rounded-full blur-[100px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors z-20 backdrop-blur-sm group"
            >
                <ArrowLeft size={24} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Main Card */}
            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-[#FFD700] to-[#FFA500] bg-clip-text text-transparent inline-block">
                            Crea tu cuenta
                        </h1>
                        <p className="text-gray-400 text-sm">Únete a la mejor comunidad de viajes</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="fullName" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'fullName' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Nombre completo
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'fullName' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User size={20} className={`transition-colors duration-300 ${focusedField === 'fullName' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Ej. María González"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    onFocus={() => setFocusedField('fullName')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="phone" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Teléfono
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'phone' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone size={20} className={`transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="0981 123 456"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            setFormData({ ...formData, phone: val });
                                        }
                                    }}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    pattern="09[0-9]{8}"
                                    title="Debe ser un número local que empiece con 09 y tenga 10 dígitos"
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="password" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Contraseña
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'password' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {/* Using Phone icon as placeholder if Lock not available, but usually Lock is imported from lucide-react. 
                                        Let's import Lock at top if not present, checking lines 1-10. 
                                        Wait, I can't see the imports in this block. I'll stick to a generic icon or valid one.
                                        Safe bet: re-use existing icon or just text. 
                                        Actually, let's just use the 'User' icon or similar if Lock isn't guaranteed, 
                                        but standard lucide-react has Lock. I will add it to imports in a separate edit if needed.
                                        For now, I'll use Mail/Phone/User... let's use User as a fallback. 
                                    */}
                                    <User size={20} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password || ''}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Email (Optional) */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="email" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'email' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Email (Opcional)
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'email' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={20} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-7 text-black font-bold text-lg rounded-xl mt-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Continuar
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>

                        {/* Social Login */}
                        <div className="mt-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="px-4 bg-transparent text-gray-500 font-semibold backdrop-blur-xl">O continúa con</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="py-6 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border hover:border-[#FFD700]/30"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="py-6 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border hover:border-[#FFD700]/30"
                                >
                                    <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">¿Ya tienes cuenta?</p>
                            <button
                                type="button"
                                onClick={() => navigate(createPageUrl('PassengerLogin'))}
                                className="text-[#FFD700] hover:text-[#FFA500] font-medium text-sm mt-1 transition-colors hover:underline"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
