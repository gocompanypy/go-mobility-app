import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ScheduleModal({ isOpen, onClose, onSchedule }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleConfirm = () => {
        if (!date || !time) {
            toast.error('Por favor selecciona fecha y hora');
            return;
        }

        const scheduledTime = new Date(`${date}T${time}`);
        if (scheduledTime < new Date()) {
            toast.error('La fecha no puede ser en el pasado');
            return;
        }

        onSchedule(scheduledTime);
        toast.success(`Viaje programado para el ${scheduledTime.toLocaleString()}`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Calendar className="text-[#00D4B1]" />
                        Programar viaje
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Fecha</label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-[#252538] border-[#2D2D44] text-white pl-10"
                            />
                            <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Hora</label>
                        <div className="relative">
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-[#252538] border-[#2D2D44] text-white pl-10"
                            />
                            <Clock size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20 text-sm text-blue-300">
                        Tu conductor llegará en el horario seleccionado (+/- 10 min). Te notificaremos cuando esté en camino.
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 hover:bg-[#252538]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-[#FFD700] hover:bg-[#FFA500] text-black font-bold"
                    >
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
