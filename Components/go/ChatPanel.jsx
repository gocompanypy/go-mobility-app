import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ChatPanel({
    tripId,
    currentUserId,
    currentUserName,
    currentUserType, // 'passenger' or 'driver'
    isOpen,
    onClose
}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && tripId) {
            loadMessages();
            const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, tripId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const data = await base44.entities.ChatMessage.filter(
                { trip_id: tripId },
                'created_date'
            );
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsLoading(true);
        try {
            await base44.entities.ChatMessage.create({
                trip_id: tripId,
                sender_type: currentUserType,
                sender_id: currentUserId,
                sender_name: currentUserName,
                content: newMessage.trim(),
            });
            setNewMessage('');
            await loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#1A1A2E] w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[#2D2D44] flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#2D2D44]">
                    <h3 className="font-semibold text-white">Chat del viaje</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>No hay mensajes aún</p>
                            <p className="text-sm">Envía un mensaje para comunicarte</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.sender_id === currentUserId;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn
                                                ? 'bg-[#00D4B1] text-black rounded-br-sm'
                                                : 'bg-[#252538] text-white rounded-bl-sm'
                                            }`}
                                    >
                                        {!isOwn && (
                                            <p className="text-xs text-gray-400 mb-1">{msg.sender_name}</p>
                                        )}
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-black/60' : 'text-gray-500'}`}>
                                            {format(new Date(msg.created_date), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#2D2D44]">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-[#252538] border-[#2D2D44] text-white placeholder:text-gray-500"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={isLoading || !newMessage.trim()}
                            className="bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
