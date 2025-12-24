import React, { useState, useEffect, useRef } from 'react';
import { goApp } from '@/api/goAppClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ChatPanel = ({ tripId, currentUserId, currentUserName, currentUserType, isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Initial load and subscription
    useEffect(() => {
        if (!isOpen || !tripId) return;

        const loadMessages = async () => {
            try {
                const data = await goApp.entities.Messages.listByTrip(tripId);
                setMessages(data);
            } catch (error) {
                console.error("Error loading chat:", error);
            }
        };

        loadMessages();

        // Subscribe to real-time messages
        const subscription = goApp.subscriptions.chat(tripId, (newMsg) => {
            setMessages(prev => [...prev, newMsg]);
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [isOpen, tripId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await goApp.entities.Messages.send(tripId, newMessage, currentUserType);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center p-0 sm:p-4">
            <div className="flex flex-col h-full w-full sm:max-w-md sm:h-[600px] bg-[#0A0A0A] border-l border-[#FFD700]/20 sm:border sm:rounded-3xl shadow-2xl animate-in slide-in-from-right sm:zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/10 bg-black/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                            <MessageSquare size={20} className="text-[#FFD700]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Chat del Viaje</h3>
                            <p className="text-xs text-[#FFD700]/70 font-medium">En línea con el {currentUserType === 'passenger' ? 'Conductor' : 'Pasajero'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                        <X size={24} />
                    </Button>
                </div>

                {/* Messages List */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                    style={{ background: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.05), transparent)' }}
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                <MessageSquare size={32} className="text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm">No hay mensajes aún.<br />Envía un mensaje para coordinar.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId;
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm shadow-md",
                                        isMe
                                            ? "bg-[#FFD700] text-black font-medium rounded-tr-none"
                                            : "bg-[#1A1A1A] text-white border border-white/10 rounded-tl-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                                        {format(new Date(msg.created_at), 'HH:mm')}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSend}
                    className="p-4 bg-black/80 border-t border-[#FFD700]/10 flex items-center gap-3 backdrop-blur-xl"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-600 focus:border-[#FFD700] focus:ring-[#FFD700]/20 h-12 rounded-xl"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        size="icon"
                        className="h-12 w-12 rounded-xl gold-glow bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black hover:scale-105 active:scale-95 transition-all"
                    >
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
