import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { goApp } from '@/api/goAppClient';

export default function ReviewModal({ open, onClose, trip, userType }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [quickReviews, setQuickReviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const quickOptions = userType === 'passenger'
        ? ['Puntual', 'Amable', 'Conducción segura', 'Vehículo limpio', 'Ruta óptima']
        : ['Puntual', 'Amable', 'Buen destino', 'Sin problemas'];

    const handleSubmit = async () => {
        if (rating === 0) return;

        setSubmitting(true);

        try {
            const updateData = userType === 'passenger'
                ? {
                    passenger_rating: rating,
                    passenger_comment: comment,
                    passenger_tags: quickReviews
                }
                : {
                    driver_rating: rating,
                    driver_comment: comment,
                    driver_tags: quickReviews
                };

            await goApp.entities.Trip.update(trip.id, updateData);

            // Update driver/passenger rating
            const targetId = userType === 'passenger' ? trip.driver_id : trip.passenger_id;
            const targetEntity = userType === 'passenger' ? 'Driver' : 'Passenger';

            if (targetId) {
                const records = await goApp.entities[targetEntity].filter({ id: targetId });
                if (records.length > 0) {
                    const target = records[0];
                    const totalRatings = (target.total_ratings || 0) + 1;
                    const currentTotal = (target.rating || 5) * (target.total_ratings || 0);
                    const newRating = (currentTotal + rating) / totalRatings;

                    await goApp.entities[targetEntity].update(targetId, {
                        rating: newRating,
                        total_ratings: totalRatings
                    });
                }
            }

            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
        }

        setSubmitting(false);
    };

    const toggleQuickReview = (option) => {
        setQuickReviews(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-black border-[#FFD700]/20 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        ¿Cómo fue tu experiencia?
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Target Info */}
                    <div className="text-center">
                        <p className="text-gray-400 mb-2">
                            {userType === 'passenger' ? 'Conductor' : 'Pasajero'}
                        </p>
                        <p className="text-xl font-semibold">
                            {userType === 'passenger' ? trip.driver_name : trip.passenger_name}
                        </p>
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
                                    className={star <= rating ? 'text-[#FFD700]' : 'text-gray-600'}
                                    fill={star <= rating ? '#FFD700' : 'none'}
                                />
                            </button>
                        ))}
                    </div>

                    {rating > 0 && (
                        <>
                            {/* Quick Reviews */}
                            <div>
                                <p className="text-sm text-gray-400 mb-3">Destacados (opcional)</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickOptions.map(option => {
                                        const isSelected = quickReviews.includes(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleQuickReview(option)}
                                                className={`px-4 py-2 rounded-full border-2 transition-all ${isSelected
                                                    ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                                                    : 'border-[#FFD700]/20 text-gray-400 hover:border-[#FFD700]/40'
                                                    }`}
                                            >
                                                {isSelected ? <ThumbsUp size={14} className="inline mr-2" /> : null}
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Comentario (opcional)</p>
                                <Textarea
                                    placeholder="Cuéntanos más sobre tu experiencia..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="bg-[#0A0A0A] border-[#FFD700]/20 text-white min-h-24"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
                            >
                                {submitting ? 'Enviando...' : 'Enviar reseña'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
