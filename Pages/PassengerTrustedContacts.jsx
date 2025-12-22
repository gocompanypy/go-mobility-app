import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, UserPlus, Shield, Trash2, Phone, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function PassengerTrustedContacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRelation, setNewRelation] = useState('');

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await goApp.entities.TrustedContact.list();
            setContacts(data || []);
        } catch (error) {
            console.error('Error loading contacts:', error);
            // toast.error('Error al cargar contactos');
        }
        setIsLoading(false);
    };

    const handleAddContact = async () => {
        if (!newName || !newPhone) {
            toast.error('Nombre y teléfono son requeridos');
            return;
        }

        try {
            const newContact = await goApp.entities.TrustedContact.add({
                name: newName,
                phone: newPhone,
                relationship: newRelation || 'Amigo/a'
            });

            setContacts([...contacts, newContact]);
            setIsAddOpen(false);
            setNewName('');
            setNewPhone('');
            setNewRelation('');
            toast.success('Contacto agregado correctamente');
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Error al agregar contacto');
        }
    };

    const handleDeleteContact = async (id) => {
        try {
            await goApp.entities.TrustedContact.remove(id);
            setContacts(contacts.filter(c => c.id !== id));
            toast.success('Contacto eliminado');
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Error al eliminar contacto');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FFD700] selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-[#FFD700]/10 to-transparent blur-3xl opacity-20" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('PassengerHome'))}
                        className="text-[#FFD700] hover:text-[#FFD700]/80 hover:bg-[#FFD700]/10 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Contactos de Confianza
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
                {/* Info Card */}
                <div className="bg-zinc-900/50 rounded-2xl p-6 mb-8 border border-[#FFD700]/30 relative overflow-hidden shadow-[0_4px_20px_rgba(255,215,0,0.1)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Shield size={100} color="#FFD700" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Shield size={20} className="text-[#FFD700]" />
                            Tu Seguridad es Primero
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            Tus contactos de confianza recibirán tu ubicación en tiempo real si activas el botón SOS durante un viaje.
                        </p>
                    </div>
                </div>

                {/* Contacts List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tus Contactos</h3>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 rounded-full px-4 h-8 text-xs font-bold shadow-lg shadow-[#FFD700]/20 border-0">
                                    <UserPlus size={14} className="mr-2" />
                                    AGREGAR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0A0A0A] border-[#FFD700]/20 text-white">
                                <DialogHeader>
                                    <DialogTitle>Agregar Contacto</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>Nombre</Label>
                                        <Input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            className="bg-[#0F0F16] border-white/10 text-white"
                                            placeholder="Ej: Mamá"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={newPhone}
                                            onChange={e => setNewPhone(e.target.value)}
                                            className="bg-[#0F0F16] border-white/10 text-white"
                                            placeholder="0981..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Parentesco (Opcional)</Label>
                                        <Input
                                            value={newRelation}
                                            onChange={e => setNewRelation(e.target.value)}
                                            className="bg-[#0F0F16] border-white/10 text-white"
                                            placeholder="Ej: Amigo, Padre, Pareja"
                                        />
                                    </div>
                                    <Button onClick={handleAddContact} className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 font-bold mt-2 border-0">
                                        Guardar Contacto
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-[#1A1A2E] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-12 bg-[#12121A]/50 rounded-2xl border border-dashed border-white/10">
                            <Users size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400 font-medium">No tienes contactos agregados</p>
                            <p className="text-xs text-gray-500 mt-1">Agrega al menos uno para mayor seguridad</p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="bg-zinc-900/50 rounded-xl p-4 flex items-center justify-between border border-white/5 hover:border-[#FFD700]/50 hover:bg-black transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-xl shadow-inner border border-white/10">
                                        <Heart size={20} className="text-[#FFD700]" fill="#FFD700" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{contact.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                                {contact.relationship}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={10} /> {contact.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
