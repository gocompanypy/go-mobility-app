import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, User, Phone, Mail, Car, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DriverSignup() {
    const navigate = useNavigate();
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        vehicleType: '',
        phone: '',
        email: ''
    });

    const vehicleTypes = [
        { value: 'economy', label: 'Coche - 4 pasajeros', icon: '🚗' },
        { value: 'comfort', label: 'Coche Confort', icon: '🚙' },
        { value: 'xl', label: 'Coche XL - 6 pasajeros', icon: '🚐' },
        { value: 'moto', label: 'Moto GO', icon: '🏍️' },
        { value: 'van', label: 'Flete / Van', icon: '🚚' },
        { value: 'gofem', label: 'GO Fem (Mujeres)', icon: '👩' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('driver_signup', JSON.stringify(formData));
        navigate(createPageUrl('DriverDocuments'));
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#FFA500]/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-black via-black/80 to-transparent" />
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
                            Únete como Conductor
                        </h1>
                        <p className="text-gray-400 text-sm">Empieza a ganar dinero manejando con GO</p>
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
                                    placeholder="Ej. Juan Pérez"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    onFocus={() => setFocusedField('fullName')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Vehicle Type */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="vehicleType" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'vehicleType' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Tipo de vehículo
                            </Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <Car size={20} className={`transition-colors duration-300 ${focusedField === 'vehicleType' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Select
                                    value={formData.vehicleType}
                                    onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                                    onOpenChange={(open) => setFocusedField(open ? 'vehicleType' : null)}
                                >
                                    <SelectTrigger className={`bg-white/5 border ${focusedField === 'vehicleType' ? 'border-[#FFD700]/50 ring-2 ring-[#FFD700]/20' : 'border-white/10'} text-white h-14 pl-12 text-base rounded-xl transition-all duration-300`}>
                                        <SelectValue placeholder="Selecciona tu vehículo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1A] border-[#FFD700]/20 text-white backdrop-blur-xl">
                                        {vehicleTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#FFD700]/10 focus:bg-[#FFD700]/10 cursor-pointer py-3">
                                                <span className="flex items-center gap-2">
                                                    <span>{type.icon}</span>
                                                    <span>{type.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="password" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'password' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Contraseña
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'password' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {/* Using User/Car/Phone fallback as I am not sure if Lock is imported and don't want to break it */}
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
                                    placeholder="+595 9..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5 group">
                            <Label htmlFor="email" className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${focusedField === 'email' ? 'text-[#FFD700]' : 'text-gray-500'}`}>
                                Correo electrónico
                            </Label>
                            <div className={`relative transition-all duration-300 rounded-xl overflow-hidden group-focus-within:ring-2 ring-[#FFD700]/50 bg-white/5 border ${focusedField === 'email' ? 'border-[#FFD700]/50' : 'border-white/10'}`}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={20} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-[#FFD700]' : 'text-gray-500'}`} />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="bg-transparent border-none text-white h-14 pl-12 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-7 text-black font-bold text-lg rounded-xl mt-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Continuar
                                <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">¿Ya tienes cuenta?</p>
                            <button
                                type="button"
                                onClick={() => navigate(createPageUrl('DriverLogin'))}
                                className="text-[#FFD700] hover:text-[#FFA500] font-medium text-sm mt-1 transition-colors hover:underline"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer simple */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} GO Logistics. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
