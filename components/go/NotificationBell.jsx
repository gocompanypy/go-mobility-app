import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationBell = () => {
    return (
        <Button variant="ghost" size="icon">
            <Bell size={20} />
        </Button>
    );
};

export default NotificationBell;
