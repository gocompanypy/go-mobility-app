import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PassengerVerification() {
    const navigate = useNavigate();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const phone = localStorage.getItem('signup_phone') || '0981 123 456';

    const handleCodeChange = (index, value) => {
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate verification success
        navigate(createPageUrl('PassengerHome'));
    };

    const handleResend = () => {
        alert('Código reenviado');
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
                <h1 className="text-3xl font-bold mb-2">Verificación</h1>
                <p className="text-gray-400 mb-8">
                    Ingresa el código enviado a{' '}
                    <span className="text-[#FFD700]">{phone}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Code Inputs */}
                    <div className="flex justify-center gap-3">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                className="w-14 h-16 text-center text-2xl font-bold bg-[#0A0A0A] border-[#FFD700]/20 text-white"
                            />
                        ))}
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                        style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                    >
                        Verificar código
                    </Button>

                    <p className="text-center text-sm text-gray-400">
                        ¿No recibiste el código?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-[#FFD700] font-semibold hover:underline"
                        >
                            Reenviar
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
