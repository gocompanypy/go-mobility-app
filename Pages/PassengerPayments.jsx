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
                                    {selectedMethod === 'cash' ? 'Efectivo' : `•••• ${cards.find(c => c.id === selectedMethod)?.last4}`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {selectedMethod === 'cash' ? 'Pago directo al conductor' : 'Tarjeta de crédito/débito'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods List */}
                <div className="space-y-4">
                    <h2 className="text-sm text-gray-400 px-2">TUS MÉTODOS DE PAGO</h2>

                    {/* Cash Option */}
                    <button
                        onClick={() => setSelectedMethod('cash')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === 'cash' ? 'bg-[#252538] border-[#00D4B1]' : 'bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#1A1A2E]'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 rounded bg-[#1A1A2E] flex items-center justify-center text-green-500 font-bold border border-[#2D2D44]">$</div>
                            <span className="font-medium">Efectivo</span>
                        </div>
                        {selectedMethod === 'cash' && <CheckCircle2 className="text-[#00D4B1]" />}
                    </button>

                    {/* Cards */}
                    {cards.map(card => (
                        <div
                            key={card.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedMethod === card.id ? 'bg-[#252538] border-[#00D4B1]' : 'bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#1A1A2E]'}`}
                        >
                            <button
                                onClick={() => setSelectedMethod(card.id)}
                                className="flex-1 flex items-center gap-4"
                            >
                                <div className="w-12 h-8 rounded bg-[#1A1A2E] flex items-center justify-center border border-[#2D2D44]">
                                    <CreditCard size={18} className="text-gray-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">•••• {card.last4}</p>
                                    <p className="text-xs text-gray-400">Vence: {card.expiry}</p>
                                </div>
                            </button>
                            <div className="flex items-center gap-2">
                                {selectedMethod === card.id && <CheckCircle2 className="text-[#00D4B1] mr-2" />}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-red-400"
                                    onClick={() => handleDeleteCard(card.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Add Card Button */}
                    {!showAddCard ? (
                        <button
                            onClick={() => setShowAddCard(true)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-[#2D2D44] hover:bg-[#1A1A2E] text-blue-400 transition-colors"
                        >
                            <div className="w-12 h-8 flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <span className="font-medium">Agregar método de pago</span>
                        </button>
                    ) : (
                        <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                            <CardContent className="p-6">
                                <form onSubmit={handleAddCard} className="space-y-4">
                                    <Input
                                        placeholder="Número de tarjeta"
                                        value={newCard.number}
                                        onChange={e => setNewCard({ ...newCard, number: e.target.value })}
                                        required
                                        className="bg-[#0A0A0A] border-[#2D2D44]"
                                    />
                                    <div className="flex gap-4">
                                        <Input
                                            placeholder="MM/YY"
                                            value={newCard.expiry}
                                            onChange={e => setNewCard({ ...newCard, expiry: e.target.value })}
                                            required
                                            className="bg-[#0A0A0A] border-[#2D2D44]"
                                        />
                                        <Input
                                            placeholder="CVC"
                                            value={newCard.cvc}
                                            onChange={e => setNewCard({ ...newCard, cvc: e.target.value })}
                                            required
                                            className="bg-[#0A0A0A] border-[#2D2D44]"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowAddCard(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-[#00D4B1] text-black hover:bg-[#00B89C]"
                                        >
                                            Guardar Tarjeta
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
