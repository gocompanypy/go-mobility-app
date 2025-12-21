import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PassengerPayments() {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('cash');
    const [showAddCard, setShowAddCard] = useState(false);
    const [cards, setCards] = useState([
        { id: '1', type: 'visa', last4: '4242', expiry: '12/26' }
    ]);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

    const handleAddCard = (e) => {
        e.preventDefault();
        const card = {
            id: Date.now().toString(),
            type: 'mastercard', // Simplified detection
            last4: newCard.number.slice(-4),
            expiry: newCard.expiry
        };
        setCards([...cards, card]);
        setShowAddCard(false);
        setNewCard({ number: '', expiry: '', cvc: '', name: '' });
        toast.success('Tarjeta agregada correctamente');
    };

    const handleDeleteCard = (id) => {
        setCards(cards.filter(c => c.id !== id));
        if (selectedMethod === id) setSelectedMethod('cash');
        toast.success('Tarjeta eliminada');
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
                    <h1 className="text-xl font-bold">Métodos de pago</h1>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Current Active */}
                <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                    <CardContent className="p-6">
                        <h2 className="text-sm text-gray-400 mb-4">MÉTODO PREDETERMINADO</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 rounded bg-[#252538] border border-[#2D2D44] flex items-center justify-center">
                                {selectedMethod === 'cash' ? (
                                    <span className="text-green-500 font-bold">$</span>
                                ) : (
                                    <CreditCard size={18} className="text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">
                                    {selectedMethod === 'cash' ? 'Efectivo' : 'Transferencia Bancaria'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Pago directo al conductor
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods List */}
                <div className="space-y-4">
                    <h2 className="text-sm text-gray-400 px-2">MÉTODOS DE PAGO DISPONIBLES</h2>

                    {/* Cash Option */}
                    <button
                        onClick={() => setSelectedMethod('cash')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'cash' ? 'bg-[#252538] border-[#00D4B1]' : 'bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#1A1A2E]'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 rounded bg-[#1A1A2E] flex items-center justify-center text-green-500 font-bold border border-[#2D2D44]">$</div>
                            <div className="text-left">
                                <span className="block font-medium">Efectivo</span>
                                <span className="text-xs text-gray-400">Pago directo al conductor</span>
                            </div>
                        </div>
                        {selectedMethod === 'cash' && <CheckCircle2 className="text-[#00D4B1]" />}
                    </button>

                    {/* Transfer Option */}
                    <button
                        onClick={() => setSelectedMethod('transfer')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'transfer' ? 'bg-[#252538] border-[#00D4B1]' : 'bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#1A1A2E]'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 rounded bg-[#1A1A2E] flex items-center justify-center text-blue-400 border border-[#2D2D44]">
                                <CreditCard size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-medium">Transferencia Bancaria</span>
                                <span className="text-xs text-gray-400">Pago directo al conductor</span>
                            </div>
                        </div>
                        {selectedMethod === 'transfer' && <CheckCircle2 className="text-[#00D4B1]" />}
                    </button>

                    <div className="mt-8 p-4 bg-[#1A1A2E]/50 rounded-xl border border-[#2D2D44] text-center">
                        <p className="text-sm text-gray-400">
                            <span className="text-[#FFD700] block mb-1 font-bold">Nota Importante</span>
                            Todos los pagos se realizan directamente con el conductor al finalizar el viaje.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
