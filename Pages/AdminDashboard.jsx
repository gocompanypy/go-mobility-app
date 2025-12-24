import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
  Users, Car, MapPin, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, BarChart3, Radio, Trophy, Star,
  Activity, Zap, Shield, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Logo from '@/components/go/Logo';
import { theme } from '@/components/go/theme';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    totalPassengers: 0,
    totalRevenue: 0,
    todayTrips: 0,
    todayRevenue: 0,
    // Advanced Metrics
    fillRate: 0,
    cancelRate: 0,
    avgEta: 0,
    supplyDemandRatio: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [tripsByStatus, setTripsByStatus] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('general');
  const [topDrivers, setTopDrivers] = useState([]);
  const [liveTrips, setLiveTrips] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [trips, drivers, passengers] = await Promise.all([
        goApp.entities.Trip.list('-created_date', 100),
        goApp.entities.Driver.list(),
        goApp.entities.Passenger.list(),
      ]);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTrips = trips.filter(t => new Date(t.created_at || t.created_date) >= today);
      const completedTrips = trips.filter(t => t.status === 'completed');
      const cancelledTrips = trips.filter(t => ['cancelled', 'cancelled_passenger', 'cancelled_driver'].includes(t.status));
      const activeTrips = trips.filter(t =>
        ['searching', 'accepted', 'arrived', 'in_progress'].includes(t.status)
      );
      const onlineDrivers = drivers.filter(d => d.is_online);

      const totalRevenue = completedTrips.reduce((sum, t) =>
        sum + (t.final_price || t.estimated_price || 0), 0
      );
      const todayRevenue = todayTrips.filter(t => t.status === 'completed').reduce((sum, t) =>
        sum + (t.final_price || t.estimated_price || 0), 0
      );

      // Advanced KPIs
      const fillRate = trips.length > 0 ? ((completedTrips.length / trips.length) * 100) : 0;
      const cancelRate = trips.length > 0 ? ((cancelledTrips.length / trips.length) * 100) : 0;
      const supplyDemandRatio = activeTrips.length > 0 ? (onlineDrivers.length / activeTrips.length) : (onlineDrivers.length > 0 ? 10 : 0);

      // Mock ETA (would come from DB)
      const avgEta = 4.2;

      setStats({
        totalTrips: trips.length,
        activeTrips: activeTrips.length,
        totalDrivers: drivers.length,
        onlineDrivers: onlineDrivers.length,
        totalPassengers: passengers.length,
        totalRevenue,
        todayTrips: todayTrips.length,
        todayRevenue,
        fillRate,
        cancelRate,
        avgEta,
        supplyDemandRatio
      });

      setRecentTrips(trips.slice(0, 5));

      // Calculate trips by status for pie chart
      const statusCounts = {};
      trips.forEach(t => {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      });

      const pieData = Object.entries(statusCounts).map(([status, count]) => ({
        name: theme.tripStatuses[status]?.label || status,
        value: count,
        color: theme.tripStatuses[status]?.color || '#666',
      }));
      setTripsByStatus(pieData);

      // Top Drivers
      const driversWithStats = drivers.map(driver => {
        const driverTrips = completedTrips.filter(t => t.driver_id === driver.id);
        const driverEarnings = driverTrips.reduce((sum, t) => sum + (t.final_price || t.estimated_price || 0), 0);
        return {
          ...driver,
          trip_count: driverTrips.length,
          total_revenue: driverEarnings
        };
      }).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5);
      setTopDrivers(driversWithStats);

      // Live Trips
      setLiveTrips(activeTrips.slice(0, 5));

      // Generate revenue data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayTrips = completedTrips.filter(t => {
          const tripDate = new Date(t.completed_at || t.created_at || t.created_date);
          return tripDate >= date && tripDate < nextDate;
        });

        const dayRevenue = dayTrips.reduce((sum, t) =>
          sum + (t.final_price || t.estimated_price || 0), 0
        );

        last7Days.push({
          day: format(date, 'EEE', { locale: es }),
          revenue: Math.round(dayRevenue * 100) / 100,
          trips: dayTrips.length,
        });
      }
      setRevenueData(last7Days);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setIsLoading(false);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, isInverse }) => (
    <Card className="bg-black border-[#FFD700]/20 gold-border relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={64} style={{ color }} />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={24} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-4 text-sm">
            <Badge variant="outline" className={`${isInverse ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
              <TrendingUp size={12} className="mr-1" />
              {trendValue}
            </Badge>
            <span className="text-gray-500 text-xs">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const HealthBar = ({ value, label }) => {
    // value 0-100 or ratio
    const percentage = Math.min(Math.max(value * 10, 0), 100); // Scale ratio to percentage approx
    let color = '#ef4444'; // red
    let statusText = 'Crítico';

    if (value > 0.8 && value < 1.5) {
      color = '#22c55e'; // green
      statusText = 'Saludable';
    } else if (value >= 1.5) {
      color = '#3b82f6'; // blue (excess supply)
      statusText = 'Alta Oferta';
    } else {
      color = '#eab308'; // yellow
      statusText = 'Baja Oferta';
    }

    // Manual override for logic visual
    const visualPercent = value > 2 ? 100 : (value * 50);

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">{label}</span>
          <span className="font-bold" style={{ color }}>{statusText} (Ratio: {value.toFixed(1)})</span>
        </div>
        <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor]"
            style={{ width: `${visualPercent}%`, backgroundColor: color, color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Header */}
      <div className="p-0 lg:p-4 max-w-[1600px] mx-auto">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-8 bg-[#111]/50 p-4 rounded-2xl border border-[#2D2D44]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#2D2D44]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400 font-mono">SYSTEM: ONLINE</span>
          </div>

          <nav className="flex flex-wrap justify-center items-center gap-1 bg-[#111] p-1 rounded-lg border border-[#222]">
            {[
              { id: 'general', icon: Activity, label: 'Command Center' },
              { id: 'live', icon: Radio, label: 'Live Ops' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${activeView === tab.id
                  ? 'bg-[#FFD700] text-black font-bold shadow-lg shadow-[#FFD700]/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#222]'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('AdminDrivers'))}
            className="text-gray-400 hover:text-white"
          >
            <Car size={18} />
          </Button>
        </div>
        {/* Vista General (Command Center) */}
        {activeView === 'general' && (
          <>
            {/* Health Monitor Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-[#0A0A0A] border-[#2D2D44] lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-400">
                    <Activity size={16} className="text-[#FFD700]" />
                    Salud del Mercado en Tiempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">{stats.fillRate.toFixed(0)}%</div>
                        <p className="text-sm text-gray-500">Tasa de Conversión (Fill Rate)</p>
                      </div>
                      <div className="text-center border-t border-[#222] pt-4">
                        <div className="text-2xl font-bold text-red-400 mb-1">{stats.cancelRate.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">Tasa de Cancelación</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-6 pt-2">
                      <HealthBar value={stats.supplyDemandRatio} label="Oferta (Conductores) vs Demanda (Viajes)" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-[#111] border border-[#222] flex items-center justify-between">
                          <span className="text-sm text-gray-400">ETA Promedio</span>
                          <span className="font-mono text-[#FFD700] font-bold">{stats.avgEta} min</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#111] border border-[#222] flex items-center justify-between">
                          <span className="text-sm text-gray-400">Conductores Activos</span>
                          <span className="font-mono text-blue-400 font-bold">{stats.onlineDrivers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Map Placeholder */}
              <Card className="bg-black border-[#2D2D44] relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent animate-pulse" />

                {/* Radar Grid */}
                <div className="absolute inset-0 z-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                <div className="w-32 h-32 rounded-full border border-green-500/30 flex items-center justify-center relative z-10 animate-[spin_4s_linear_infinite]">
                  <div className="w-full h-[1px] bg-green-500/50 absolute top-1/2 left-0" />
                  <div className="h-full w-[1px] bg-green-500/50 absolute top-0 left-1/2" />
                </div>
                <div className="absolute z-20 top-4 right-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-xs text-red-400 font-bold">LIVE MAP</span>
                  </div>
                </div>
                <p className="relative z-20 mt-4 text-xs text-gray-500 font-mono">MONITORIZANDO ZONA CENTRO</p>
                <Button variant="link" size="sm" className="relative z-20 text-[#00D4B1] text-xs" onClick={() => navigate(createPageUrl('AdminGeofencing'))}>
                  Ver mapa completo
                </Button>
              </Card>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Ingresos Hoy"
                value={`Gs. ${stats.todayRevenue.toLocaleString('es-PY')}`}
                subtitle="vs Gs. 0 ayer (Demo)"
                icon={DollarSign}
                color="#FFD700"
                trend="+100%"
                trendValue="Subiendo"
              />
              <StatCard
                title="Usuarios Activos"
                value={stats.activeTrips + stats.onlineDrivers}
                subtitle="Passenger + Driver"
                icon={Target}
                color="#3B82F6"
                trend="+12%"
                trendValue="Estable"
              />
              <StatCard
                title="Viajes Completados"
                value={stats.todayTrips}
                subtitle="Hoy"
                icon={CheckCircle}
                color="#10B981"
                trend="+5%"
                trendValue="Diario"
              />
              <StatCard
                title="Total Pasajeros"
                value={stats.totalPassengers}
                subtitle="Registrados"
                icon={Users}
                color="#8B5CF6"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-[#0A0A0A] border-[#2D2D44] lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white text-sm font-medium uppercase tracking-wider text-gray-400">Tendencia de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#555', fontSize: 11 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#555', fontSize: 11 }}
                          tickFormatter={(val) => `Gs. ${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                          formatter={(value) => [`Gs. ${value.toLocaleString()}`, 'Ingresos']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FFD700"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0A0A0A] border-[#2D2D44]">
                <CardHeader>
                  <CardTitle className="text-white text-sm font-medium uppercase tracking-wider text-gray-400">Estado de Viajes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tripsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {tripsByStatus.map((entry, index) => (
                            <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <span className="text-3xl font-bold text-white">{stats.totalTrips}</span>
                      <span className="text-xs text-gray-500">Total</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-6">
                    {tripsByStatus.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-400 uppercase tracking-wider">{item.name}</span>
                        </div>
                        <span className="text-white font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Live Ops View & Analytics (Simplified Placeholders for now to focus on Command Center) */}
        {activeView === 'live' && (
          <div className="text-center py-20">
            <Radio size={48} className="mx-auto text-[#FFD700] mb-4" />
            <h2 className="text-2xl font-bold text-white">Live Operations Module</h2>
            <p className="text-gray-400">Mapa en tiempo real y despacho manual</p>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="text-center py-20">
            <BarChart3 size={48} className="mx-auto text-[#FFD700] mb-4" />
            <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
            <p className="text-gray-400">Reportes financieros y de retención</p>
          </div>
        )}

      </div>
    </div>
  );
}
