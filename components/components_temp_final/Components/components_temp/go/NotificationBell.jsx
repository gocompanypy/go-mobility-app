import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { Bell, X, Gift, Car, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationBell({ userId, userType }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (userId) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 30000); // Cada 30s
            return () => clearInterval(interval);
        }
    }, [userId]);

    const loadNotifications = async () => {
        try {
            const data = await goApp.entities.Notification.filter(
                { user_id: userId, user_type: userType },
                '-created_date',
                20
            );
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await goApp.entities.Notification.update(notificationId, { is_read: true });
            loadNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.is_read);
            await Promise.all(
                unread.map(n => goApp.entities.Notification.update(n.id, { is_read: true }))
            );
            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'trip': return <Car size={20} className="text-[#00D4B1]" />;
            case 'promotion': return <Gift size={20} className="text-[#FFD700]" />;
            case 'reward': return <Gift size={20} className="text-purple-400" />;
            case 'payment': return <DollarSign size={20} className="text-green-400" />;
            default: return <Info size={20} className="text-blue-400" />;
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="relative text-white"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="bg-black border-[#FFD700]/20 text-white w-full sm:max-w-md gold-border" style={{ boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)' }}>
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-white">Notificaciones</SheetTitle>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-[#00D4B1] text-xs"
                                >
                                    Marcar todas leídas
                                </Button>
                            )}
                        </div>
                    </SheetHeader>

                    <div className="mt-6 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell size={48} className="mx-auto text-gray-500 mb-4" />
                                <p className="text-gray-400">No tienes notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`
                    p-4 rounded-xl border cursor-pointer transition-colors
                    ${notification.is_read
                                            ? 'bg-[#0A0A0A] border-[#1A1A1A]'
                                            : 'bg-black border-[#FFD700]/30 gold-border'
                                        }
                  `}
                                    style={{ background: notification.is_read ? '#0A0A0A' : 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getIcon(notification.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="font-semibold text-sm">{notification.title}</h4>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-[#FFD700] rounded-full gold-glow" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {format(new Date(notification.created_date), "dd MMM 'a las' HH:mm", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
