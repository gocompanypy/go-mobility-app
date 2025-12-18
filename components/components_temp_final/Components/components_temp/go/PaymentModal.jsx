import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Banknote, Check } from 'lucide-react';

export default function PaymentModal({ open, onClose, amount, onPaymentComplete }) {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [processing, setProcessing] = useState(false);

    const methods = [
        { id: 'card', label: 'Tarjeta', icon: CreditCard },
        { id: 'wallet', label: 'GO Wallet', icon: Wallet },
        { id: 'cash', label: 'Efectivo', icon: Banknote }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        onPaymentComplete({ method: paymentMethod, amount });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-black border-[#FFD700]/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Método de pago</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Total Amount */}
                    <div className="p-4 rounded-xl border border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10">
                        <p className="text-sm text-gray-400 mb-1">Total a pagar</p>
                        <p className="text-3xl font-bold text-[#FFD700]">Gs. {amount?.toLocaleString('es-PY')}</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3">
                        {methods.map(method => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;

                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                                        : 'border-[#FFD700]/20 hover:border-[#FFD700]/40'
                                        }`}
                                >
                                    <Icon size={24} className={isSelected ? 'text-[#FFD700] mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
                                    <p className={`text-sm ${isSelected ? 'text-[#FFD700] font-semibold' : 'text-gray-400'}`}>
                                        {method.label}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Card Form */}
                    {paymentMethod === 'card' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Número de tarjeta</Label>
                                <Input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardData.number}
                                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                    className="bg-[#0A0A0A] border-[#FFD700]/20 text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha exp.</Label>
                                    <Input
                                        type="text"
                                        placeholder="MM/AA"
                                        value={cardData.expiry}
                                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                        className="bg-[#0A0A0A] border-[#FFD700]/20 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CVV</Label>
                                    <Input
                                        type="text"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                        className="bg-[#0A0A0A] border-[#FFD700]/20 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nombre en la tarjeta</Label>
                                <Input
                                    type="text"
                                    placeholder="JUAN PÉREZ"
                                    value={cardData.name}
                                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                    className="bg-[#0A0A0A] border-[#FFD700]/20 text-white"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                            >
                                {processing ? 'Procesando...' : 'Pagar ahora'}
                            </Button>
                        </form>
                    )}

                    {/* Wallet */}
                    {paymentMethod === 'wallet' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-[#FFD700]/20 bg-[#0A0A0A]">
                                <p className="text-sm text-gray-400 mb-1">Saldo disponible</p>
                                <p className="text-2xl font-bold text-[#FFD700]">Gs. 150.000</p>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                            >
                                {processing ? 'Procesando...' : 'Pagar con Wallet'}
                            </Button>
                        </div>
                    )}

                    {/* Cash */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-[#FFD700]/20 bg-[#0A0A0A] text-center">
                                <Banknote size={48} className="text-[#FFD700] mx-auto mb-3" />
                                <p className="text-gray-400">Paga en efectivo directamente al conductor</p>
                            </div>
                            <Button
                                onClick={() => {
                                    onPaymentComplete({ method: 'cash', amount });
                                    onClose();
                                }}
                                className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                            >
                                Confirmar pago en efectivo
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
