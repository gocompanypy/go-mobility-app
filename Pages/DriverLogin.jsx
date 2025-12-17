import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DriverLogin() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(createPageUrl('DriverHome'));
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="p-4 border-b border-[#FFD700]/20">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="flex-1 px-6 py-8 flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
                <p className="text-gray-400 mb-8">Accede a tu cuenta de conductor</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-400 flex items-center gap-2">
                            <Phone size={16} />
                            Número de teléfono
                        </Label>
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
                            pattern="09[0-9]{8}"
                            title="Debe ser un número local que empiece con 09 y tenga 10 dígitos"
                            required
                            className="bg-[#0A0A0A] border-[#FFD700]/20 text-white h-14 text-lg"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                    >
                        Continuar
                    </Button>
                </form>
            </div>
        </div>
    );
}
