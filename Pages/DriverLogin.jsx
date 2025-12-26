import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Phone, ChevronRight, Clock, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
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
    const [verificationStatus, setVerificationStatus] = useState(null); // null, 'pending'
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user, profile } = await goApp.auth.login(phone, password);

            // Verificación de Estado
            if (profile?.status !== 'active') {
                // Si no está activo, verificamos por qué
                if (profile?.status === 'pending') {
                    setVerificationStatus('pending'); // Mostramos pantalla de espera
                    return; // Detenemos la redirección
                }

                if (profile?.status === 'suspended' || profile?.status === 'blocked') {
                    toast.error("Tu cuenta ha sido suspendida. Contacta a soporte.");
                    return;
                }
            }

            toast.success(`¡Bienvenido de nuevo, ${profile?.first_name || 'Conductor'}! 👋`);
            navigate(createPageUrl('DriverHome'));
        } catch (error) {
            console.error(error);
            // Customizable error handling for drivers
            const errorMessage = error.message?.toLowerCase() || '';
            const isAuthError =
                errorMessage.includes("credenciales incorrectas") ||
                errorMessage.includes("invalid login credentials") ||
                errorMessage.includes("invalid_credentials") ||
                errorMessage.includes("user not found");

            if (isAuthError) {
                toast("No pudimos ingresar", {
                    description: "Verifica tus datos. Si aún no eres conductor, regístrate aquí.",
                    action: {
                        label: "Registrarme",
                        onClick: () => navigate(createPageUrl('DriverSignup')),
                    },
                });
            } else {
                toast.error("Error al iniciar sesión", {
                    description: error.message || "Verifica tu conexión e inténtalo de nuevo."
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (verificationStatus === 'pending') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-md bg-[#1A1A1A] border border-[#FFD700]/20 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#FFD700]/30">
                        <Clock size={40} className="text-[#FFD700]" strokeWidth={2} />
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-white">
                        Verificación en Proceso
                    </h2>

                    <div className="space-y-4 mb-8">
                        <p className="text-gray-400 leading-relaxed">
                            Tu cuenta se encuentra en revisión. Estamos validando tu documentación para asegurar la calidad del servicio.
                        </p>

                        <div className="bg-[#FFD700]/5 rounded-xl p-4 border border-[#FFD700]/10 text-left">
                            <h4 className="text-[#FFD700] text-sm font-semibold mb-1 flex items-center gap-2">
                                <ShieldAlert size={14} /> Importante
                            </h4>
                            <p className="text-xs text-gray-400">
                                Este proceso suele tomar menos de 24 horas. Recibirás una notificación cuando tu cuenta sea aprobada.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate(createPageUrl('Home'))}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 rounded-xl"
                    >
                        Volver al Inicio
                    </Button>
                </div>
            </div>
        );
    }

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

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        {/* Anti-autofill trap: Hidden inputs to capture browser auto-fill attempts */}
                        <input type="text" style={{ display: 'none' }} />
                        <input type="password" style={{ display: 'none' }} />

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
                                    name="driver_phone_login_field"
                                    type="tel"
                                    autoComplete="off"
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
                                    <Lock size={20} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="password"
                                    name="password_fake_123"
                                    autoComplete="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 pr-12 text-lg placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wide"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
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
