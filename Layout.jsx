import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Home, Car, User, Settings, LogOut, LayoutDashboard, Crown, Archive, HelpCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/go/Logo';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const path = location.pathname;

    // Determine user context based on path
    const isDriver = path.includes('/driver');
    const isAdmin = path.includes('/admin');
    const isPassenger = !isDriver && !isAdmin && path !== '/';

    const menuItems = [
        { icon: Home, label: 'Inicio', path: isDriver ? '/driver/home' : (isAdmin ? '/admin/dashboard' : '/passenger/home') },
        ...(isPassenger ? [
            { icon: Car, label: 'Viajes', path: '/passenger/history' },
            { icon: Crown, label: 'Recompensas', path: '/passenger/rewards' },
            { icon: Archive, label: 'Promociones', path: '/passenger/promotions' },
        ] : []),
        ...(isDriver ? [
            { icon: Car, label: 'Mis Viajes', path: '/driver/history' }, // Assuming this exists or will be added
            { icon: LayoutDashboard, label: 'Ganancias', path: '/driver/earnings' },
        ] : []),
        ...(isAdmin ? [
            { icon: User, label: 'Conductores', path: '/admin/drivers' },
            { icon: Car, label: 'Viajes', path: '/admin/trips' },
            { icon: DollarSign, label: 'Finanzas', path: '/admin/finance' },
            { icon: Settings, label: 'Precios', path: '/admin/pricing' },
        ] : []),
        { icon: Settings, label: 'Configuración', path: '/settings' },
        { icon: HelpCircle, label: 'Ayuda', path: '/help' },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#1A1A2E] text-white border-r border-[#2D2D44]">
            <div className="p-6 border-b border-[#2D2D44]">
                <Logo size="md" />
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, idx) => {
                    const isActive = path === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-[#00D4B1]/10 text-[#00D4B1]'
                                : 'text-gray-400 hover:bg-[#252538] hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#2D2D44]">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <SidebarContent />
            </div>

            {/* Mobile Navbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A2E]/80 backdrop-blur-md border-b border-[#2D2D44] z-50 flex items-center justify-between px-4">
                <Logo size="sm" />
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-[#2D2D44] w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 w-full">
                <div className="pt-16 md:pt-0 min-h-screen">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
