import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Car, Users, Map, DollarSign,
    Megaphone, Shield, LogOut, Menu, X, Search, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/go/Logo';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('go_user');
        navigate('/admin');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Car, label: 'Conductores', path: '/admin/drivers' },
        { icon: Users, label: 'Pasajeros', path: '/admin/passengers' },
        { icon: Map, label: 'Viajes', path: '/admin/trips' },
        { icon: DollarSign, label: 'Finanzas', path: '/admin/finance' },
        { icon: Megaphone, label: 'Marketing', path: '/admin/marketing' },
        { icon: Shield, label: 'Seguridad', path: '/admin/security' },
    ];

    const getPageTitle = (pathname) => {
        const item = navItems.find(i => i.path === pathname);
        return item ? item.label : 'Panel de Admin';
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-[#2D2D44] bg-[#0F0F1A] fixed h-full z-50">
                <div className="h-16 flex items-center px-6 border-b border-[#2D2D44]">
                    <Logo size="md" />
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#00D4B1]/10 text-[#00D4B1] font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A2E]'
                                }`
                            }
                        >
                            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#2D2D44]">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-3"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] bg-[#0F0F1A] flex flex-col">
                    <div className="h-16 flex items-center justify-between px-4 border-b border-[#2D2D44]">
                        <Logo size="sm" />
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="text-gray-400" />
                        </Button>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${isActive
                                        ? 'bg-[#00D4B1]/10 text-[#00D4B1]'
                                        : 'text-gray-400'
                                    }`
                                }
                            >
                                <item.icon size={24} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 mt-8 gap-3"
                            onClick={handleLogout}
                        >
                            <LogOut size={24} />
                            Cerrar Sesión
                        </Button>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
                {/* Elegant Top Navbar */}
                <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[#2D2D44]/60 bg-[#0F0F1A]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-gray-400"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu />
                        </Button>

                        {/* Page Title */}
                        <h2 className="text-lg lg:text-xl font-semibold text-white tracking-tight">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Search Bar (Desktop) */}
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#00D4B1] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="h-10 w-48 lg:w-64 rounded-xl border border-[#2D2D44] bg-[#1A1A2E] pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-[#00D4B1] focus:outline-none focus:ring-1 focus:ring-[#00D4B1] transition-all"
                            />
                        </div>

                        {/* Search Icon (Mobile) */}
                        <button className="md:hidden text-gray-400 hover:text-white">
                            <Search size={20} />
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-[#1A1A2E] rounded-full transition-all">
                            <Bell size={20} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0F0F1A] animate-pulse" />
                        </button>

                        {/* Divider */}
                        <div className="h-8 w-px bg-[#2D2D44]" />

                        {/* Profile */}
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-[#1A1A2E] p-1.5 rounded-full pr-3 transition-colors border border-transparent hover:border-[#2D2D44]">
                            <div className="h-8 w-8 overflow-hidden rounded-full border border-[#2D2D44] bg-[#1A1A2E]">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                    alt="Admin"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col text-right hidden lg:block leading-tight">
                                <span className="text-sm font-medium text-white">Admin User</span>
                                <span className="text-[10px] text-gray-400">Super Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
