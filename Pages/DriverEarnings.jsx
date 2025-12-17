import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Logo from '@/components/go/Logo';

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
            const user = await base44.auth.me();
            const drivers = await base44.entities.Driver.filter({ created_by: user.email });

            if (drivers.length > 0) {
                setDriver(drivers[0]);

                const tripData = await base44.entities.Trip.filter({
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
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-lg border-b border-[#2D2D44]">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(createPageUrl('DriverHome'))}
                        className="text-white"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-xl font-bold">Mis ganancias</h1>
                </div>
            </header>

            <div className="px-4 py-6">
                {/* Period Selector */}
                <Tabs value={period} onValueChange={setPeriod} className="mb-6">
                    <TabsList className="bg-[#1A1A2E] w-full">
                        <TabsTrigger value="week" className="flex-1 data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black">
                            Esta semana
                        </TabsTrigger>
                        <TabsTrigger value="month" className="flex-1 data-[state=active]:bg-[#00D4B1] data-[state=active]:text-black">
                            Este mes
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Main Stats Card */}
                <div className="bg-gradient-to-br from-[#00D4B1] to-[#00B89C] rounded-2xl p-6 mb-6">
                    <p className="text-black/70 mb-1">Ganancias totales</p>
                    <p className="text-4xl font-bold text-black mb-4">
                        Gs. {stats.total.toLocaleString('es-PY')}
                    </p>
                    <div className="flex gap-6">
                        <div>
                            <p className="text-black/70 text-sm">Viajes</p>
                            <p className="text-xl font-semibold text-black">{stats.trips}</p>
                        </div>
                        <div>
                            <p className="text-black/70 text-sm">Promedio/viaje</p>
                            <p className="text-xl font-semibold text-black">Gs. {stats.avgPerTrip.toLocaleString('es-PY')}</p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2D2D44] mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#00D4B1]" />
                        Ganancias por día
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B6B80', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B6B80', fontSize: 12 }}
                                    tickFormatter={(value) => `Gs. ${value.toLocaleString('es-PY')}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#252538',
                                        border: '1px solid #2D2D44',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    formatter={(value) => [`Gs. ${value.toLocaleString('es-PY')}`, 'Ganancias']}
                                />
                                <Bar
                                    dataKey="earnings"
                                    fill="#00D4B1"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2D2D44]">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Car size={16} />
                            <span className="text-sm">Total histórico</span>
                        </div>
                        <p className="text-xl font-bold">Gs. {(driver?.total_earnings || 0).toLocaleString('es-PY')}</p>
                    </div>
                    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2D2D44]">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Calendar size={16} />
                            <span className="text-sm">Viajes totales</span>
                        </div>
                        <p className="text-xl font-bold">{driver?.total_trips || 0}</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-[#252538] rounded-xl p-4 border border-[#2D2D44]">
                    <p className="text-sm text-gray-400">
                        💡 Las ganancias mostradas son después de la comisión de GO (20%).
                        Los pagos se procesan semanalmente los lunes.
                    </p>
                </div>
            </div>
        </div>
    );
}
