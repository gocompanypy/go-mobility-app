import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
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
    const [formData, setFormData] = useState({
        fullName: '',
        vehicleType: '',
        phone: '',
        email: ''
    });

    const vehicleTypes = [
        { value: 'economy', label: 'Coche - 4 pasajeros' },
        { value: 'comfort', label: 'Coche Confort' },
        { value: 'xl', label: 'Coche XL - 6 pasajeros' },
        { value: 'moto', label: 'Moto GO' },
        { value: 'van', label: 'Flete / Van' },
        { value: 'gofem', label: 'GO Fem (Mujeres)' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('driver_signup', JSON.stringify(formData));
        navigate(createPageUrl('DriverDocuments'));
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
            <div className="flex-1 px-6 py-8 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-2">Registro de conductor</h1>
                <p className="text-gray-400 mb-8">Completa tu registro para comenzar</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-400">
                            Nombre completo
                        </Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Carlos Martínez"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    {/* Vehicle Type */}
                    <div className="space-y-2">
                        <Label htmlFor="vehicleType" className="text-gray-400">
                            Tipo de vehículo
                        </Label>
                        <Select
                            value={formData.vehicleType}
                            onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                        >
                            <SelectTrigger className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg">
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0A] border-[#FFD700]/20">
                                {vehicleTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value} className="text-white">
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-400 flex items-center gap-2">
                            <Phone size={16} />
                            Teléfono
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+34 600 000 000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-400 flex items-center gap-2">
                            <Mail size={16} />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="conductor@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-black font-bold text-lg border-0 gold-glow mt-8"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                    >
                        Continuar
                    </Button>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => navigate(createPageUrl('DriverLogin'))}
                            className="text-[#FFD700] font-semibold hover:underline"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
