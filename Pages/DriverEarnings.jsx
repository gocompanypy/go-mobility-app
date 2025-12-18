import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Car, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function DriverEarnings() {
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [trips, setTrips] = useState([]);
    const [period, setPeriod] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({ total: 0, trips: 0, avgPerTrip: 0 });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (trips.length > 0) {
            calculateStats();
        }
    }, [trips, period]);

    const loadData = async () => {
        try {
            const user = await goApp.auth.me();
            const drivers = await goApp.entities.Driver.filter({ created_by: user.email });

            if (drivers.length > 0) {
                setDriver(drivers[0]);

                const tripData = await goApp.entities.Trip.filter({
                    driver_id: drivers[0].id,
                    status: 'completed'
                });
                setTrips(tripData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const calculateStats = () => {
        const now = new Date();
        let startDate, endDate;

        if (period === 'week') {
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1 });
        } else {
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        const filteredTrips = trips.filter(t => {
            const tripDate = new Date(t.completed_at);
            return tripDate >= startDate && tripDate <= endDate;
        });

        const total = filteredTrips.reduce((sum, t) =>
            sum + ((t.final_price || t.estimated_price) * 0.8), 0
        );

        const avgPerTrip = filteredTrips.length > 0 ? total / filteredTrips.length : 0;

        setStats({
            total,
            trips: filteredTrips.length,
            avgPerTrip
        });

        // Generate chart data
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const data = days.map(day => {
            const dayTrips = filteredTrips.filter(t =>
                format(new Date(t.completed_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const earnings = dayTrips.reduce((sum, t) =>
                sum + ((t.final_price || t.estimated_price) * 0.8), 0
            );

            return {
                day: format(day, period === 'week' ? 'EEE' : 'd', { locale: es }),
                earnings: Math.round(earnings * 100) / 100,
                isToday: isToday(day)
            };
        });

        setChartData(data);
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none fixed">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FFD700]/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-[#FFA500]/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => navigate(createPageUrl('DriverHome'))}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-200" />
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Mis Ganancias</h1>
                </div>
            </header>

            <div className="px-5 py-6 relative z-10 max-w-2xl mx-auto">
                {/* Period Selector */}
                <Tabs value={period} onValueChange={setPeriod} className="mb-8">
                    <TabsList className="bg-white/5 border border-white/10 w-full p-1 rounded-xl h-12">
                        <TabsTrigger
                            value="week"
                            className="flex-1 rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:font-bold transition-all duration-300"
                        >
                            Esta semana
                        </TabsTrigger>
                        <TabsTrigger
                            value="month"
                            className="flex-1 rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black data-[state=active]:font-bold transition-all duration-300"
                        >
                            Este mes
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Main Stats Card */}
                <div className="rounded-3xl p-6 mb-8 relative overflow-hidden group">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

                    {/* Shine Effect */}
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                    <div className="relative z-10">
                        <p className="text-black/70 font-medium mb-1 flex items-center gap-2">
                            <DollarSign size={16} className="text-black" />
                            Ganancias totales
                        </p>
                        <p className="text-4xl font-black text-black mb-6 tracking-tight">
                            Gs. {stats.total.toLocaleString('es-PY')}
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
                            <div>
                                <p className="text-black/60 text-xs uppercase tracking-wider font-bold">Viajes</p>
                                <p className="text-2xl font-bold text-black">{stats.trips}</p>
                            </div>
                            <div>
                                <p className="text-black/60 text-xs uppercase tracking-wider font-bold">Promedio / Viaje</p>
                                <p className="text-2xl font-bold text-black">Gs. {Math.round(stats.avgPerTrip).toLocaleString('es-PY')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 shadow-xl">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-white">
                        <TrendingUp size={20} className="text-[#FFD700]" />
                        Tendencia
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 11 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 215, 0, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid rgba(255, 215, 0, 0.2)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#FFD700' }}
                                    formatter={(value) => [`Gs. ${value.toLocaleString('es-PY')}`, '']}
                                    labelStyle={{ color: '#888', marginBottom: '0.5rem' }}
                                />
                                <Bar
                                    dataKey="earnings"
                                    fill="url(#colorGold)"
                                    radius={[6, 6, 6, 6]}
                                    maxBarSize={50}
                                >
                                    <defs>
                                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FFD700" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#FFA500" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-[#FFD700] mb-2">
                            <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Total Histórico</p>
                        <p className="text-xl font-bold text-white">Gs. {(driver?.total_earnings || 0).toLocaleString('es-PY')}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-[#FFA500] mb-2">
                            <div className="p-2 bg-[#FFA500]/10 rounded-lg">
                                <Car size={18} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Viajes Totales</p>
                        <p className="text-xl font-bold text-white">{driver?.total_trips || 0}</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl p-4 flex gap-3 items-start">
                    <Info size={20} className="text-[#FFD700] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400 leading-relaxed">
                        <span className="text-[#FFD700] font-semibold">Nota:</span> Las ganancias mostradas ya tienen descontada la tasa de servicio de GO (20%). Los pagos se transfieren automáticamente cada lunes.
                    </p>
                </div>
            </div>
        </div>
    );
}
