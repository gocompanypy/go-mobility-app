import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PassengerSignup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save phone to pass to verification
        localStorage.setItem('signup_phone', formData.phone);
        navigate(createPageUrl('PassengerVerification'));
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-[#FFD700]/20">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 px-6 py-8">
                <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>
                <p className="text-gray-400 mb-8">Únete a miles de usuarios</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-400 flex items-center gap-2">
                            <User size={16} />
                            Nombre completo
                        </Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Juan Pérez"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-400 flex items-center gap-2">
                            <Phone size={16} />
                            Número de teléfono
                        </Label>
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
                            pattern="09[0-9]{8}"
                            title="Debe ser un número local que empiece con 09 y tenga 10 dígitos"
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    {/* Email (optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-400 flex items-center gap-2">
                            <Mail size={16} />
                            Email (opcional)
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-black font-bold text-lg border-0 gold-glow mt-8"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                    >
                        Enviar código SMS
                    </Button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => navigate(createPageUrl('PassengerLogin'))}
                            className="text-[#FFD700] font-semibold hover:underline"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </form>

                {/* Social Login */}
                <div className="mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#FFD700]/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-black text-gray-400">O continúa con</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="py-6 border-[#FFD700]/20 text-white hover:bg-[#FFD700]/10"
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
                            className="py-6 border-[#FFD700]/20 text-white hover:bg-[#FFD700]/10"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
