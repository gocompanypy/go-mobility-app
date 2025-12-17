import React, { useState } from 'react';
import { Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function RatingModal({
    open,
    onClose,
    onSubmit,
    targetName,
    targetType = 'driver', // 'driver' or 'passenger'
    tripPrice = 0
}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [tip, setTip] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tipOptions = [0, 1, 2, 5];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit({ rating, comment, tip });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                        ¿Cómo fue tu viaje?
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Target info */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#252538] rounded-full mx-auto mb-2 flex items-center justify-center text-3xl">
                            {targetType === 'driver' ? '🚗' : '👤'}
                        </div>
                        <p className="font-semibold">{targetName}</p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    size={40}
                                    className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}
                                    fill={star <= rating ? 'currentColor' : 'none'}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Tip (only for passengers rating drivers) */}
                    {targetType === 'driver' && (
                        <div>
                            <p className="text-sm text-gray-400 mb-2 text-center">
                                ¿Quieres dejar propina?
                            </p>
                            <div className="flex justify-center gap-2">
                                {tipOptions.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setTip(amount)}
                                        className={`px-4 py-2 rounded-lg border transition-all ${tip === amount
                                            ? 'border-[#00D4B1] bg-[#00D4B1]/20 text-[#00D4B1]'
                                            : 'border-[#2D2D44] bg-[#252538] text-gray-400 hover:border-[#00D4B1]/50'
                                            }`}
                                    >
                                        {amount === 0 ? 'Sin propina' : `Gs. ${amount.toLocaleString('es-PY')}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comment */}
                    <div>
                        <Textarea
                            placeholder="Deja un comentario (opcional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-[#252538] border-[#2D2D44] text-white placeholder:text-gray-500 min-h-[80px]"
                        />
                    </div>

                    {/* Total */}
                    {targetType === 'driver' && tip > 0 && (
                        <div className="bg-[#252538] rounded-lg p-3 flex justify-between items-center">
                            <span className="text-gray-400">Total con propina</span>
                            <span className="text-xl font-bold text-[#00D4B1]">
                                Gs. {(tripPrice + tip).toLocaleString('es-PY')}
                            </span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-[#00D4B1] hover:bg-[#00B89C] text-black font-semibold py-6"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
