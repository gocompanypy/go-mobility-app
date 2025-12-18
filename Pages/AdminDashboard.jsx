import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import {
  Users, Car, MapPin, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, BarChart3, Radio, Trophy, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
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

      const todayTrips = trips.filter(t => new Date(t.created_date) >= today);
      const completedTrips = trips.filter(t => t.status === 'completed');
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

      setStats({
        totalTrips: trips.length,
        activeTrips: activeTrips.length,
        totalDrivers: drivers.length,
        onlineDrivers: onlineDrivers.length,
        totalPassengers: passengers.length,
        totalRevenue,
        todayTrips: todayTrips.length,
        todayRevenue,
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

      // Generate revenue data for last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayTrips = completedTrips.filter(t => {
          const tripDate = new Date(t.completed_at || t.created_date);
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

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-opacity-20`} style={{ backgroundColor: `${color}20` }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-sm">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-green-400">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b-2 border-[#FFD700]/20 gold-glow" style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.15)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo size="md" />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2">
            <Button
              variant={activeView === 'general' ? 'default' : 'ghost'}
              onClick={() => setActiveView('general')}
              className={activeView === 'general'
                ? 'text-black font-bold border-0'
                : 'text-gray-400 hover:text-white'}
              style={activeView === 'general' ? {
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)'
              } : {}}
            >
              <BarChart3 size={18} className="mr-2" />
              Vista general
            </Button>
            <Button
              variant={activeView === 'live' ? 'default' : 'ghost'}
              onClick={() => setActiveView('live')}
              className={activeView === 'live'
                ? 'text-black font-bold border-0'
                : 'text-gray-400 hover:text-white'}
              style={activeView === 'live' ? {
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)'
              } : {}}
            >
              <Radio size={18} className="mr-2" />
              Viajes en vivo
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('AdminDrivers'))}
              className="text-gray-400 hover:text-white"
            >
              <Car size={18} className="mr-2" />
              Conductores
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('AdminPassengers'))}
              className="text-gray-400 hover:text-white"
            >
              <Users size={18} className="mr-2" />
              Pasajeros
            </Button>
            <Button
              variant={activeView === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveView('analytics')}
              className={activeView === 'analytics'
                ? 'text-black font-bold border-0'
                : 'text-gray-400 hover:text-white'}
              style={activeView === 'analytics' ? {
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)'
              } : {}}
            >
              <TrendingUp size={18} className="mr-2" />
              Analíticas
            </Button>
          </nav>
        </div>
      </header>

      <main className="p-6">
        {/* Vista General */}
        {activeView === 'general' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Viajes Activos"
                value={stats.activeTrips}
                subtitle="En tiempo real"
                icon={MapPin}
                color="#FFD700"
              />
              <StatCard
                title="Conductores Online"
                value={`${stats.onlineDrivers}/${stats.totalDrivers}`}
                subtitle="Disponibles ahora"
                icon={Car}
                color="#3B82F6"
              />
              <StatCard
                title="Ingresos Hoy"
                value={`Gs. ${stats.todayRevenue.toLocaleString('es-PY')}`}
                subtitle={`${stats.todayTrips} viajes`}
                icon={DollarSign}
                color="#F59E0B"
              />
              <StatCard
                title="Total Pasajeros"
                value={stats.totalPassengers}
                icon={Users}
                color="#8B5CF6"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Revenue Chart */}
              <Card className="bg-black border-[#FFD700]/20 lg:col-span-2 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#FFD700]" />
                    Ingresos (últimos 7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                          formatter={(value, name) => [
                            name === 'revenue' ? `Gs. ${value.toLocaleString('es-PY')}` : value,
                            name === 'revenue' ? 'Ingresos' : 'Viajes'
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FFD700"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Pie Chart */}
              <Card className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                <CardHeader>
                  <CardTitle className="text-white">Estado de Viajes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tripsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {tripsByStatus.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#252538',
                            border: '1px solid #2D2D44',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {tripsByStatus.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-400">{item.name}</span>
                        </div>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Trips */}
            <Card className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Viajes Recientes</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl('AdminTrips'))}
                  className="text-[#00D4B1]"
                >
                  Ver todos
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2D2D44]">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Pasajero</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Conductor</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Precio</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrips.map((trip) => {
                        const statusConfig = theme.tripStatuses[trip.status] || {};
                        return (
                          <tr key={trip.id} className="border-b border-[#2D2D44] hover:bg-[#252538]">
                            <td className="py-3 px-4 text-white font-mono text-sm">
                              {trip.id.slice(0, 8)}...
                            </td>
                            <td className="py-3 px-4 text-white">{trip.passenger_name || '-'}</td>
                            <td className="py-3 px-4 text-white">{trip.driver_name || '-'}</td>
                            <td className="py-3 px-4">
                              <Badge
                                style={{
                                  backgroundColor: `${statusConfig.color}20`,
                                  color: statusConfig.color,
                                  borderColor: `${statusConfig.color}30`
                                }}
                              >
                                {statusConfig.label || trip.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-[#00D4B1] font-medium">
                              Gs. {(trip.final_price || trip.estimated_price)?.toLocaleString('es-PY') || '0'}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {format(new Date(trip.created_date), 'dd/MM HH:mm')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Conductores y Viajes Recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Top Conductores */}
              <Card className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy size={20} className="text-[#FFD700]" />
                    Top Conductores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDrivers.map((driver, index) => {
                      const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#808080', '#A0A0A0'];
                      const medals = ['🥇', '🥈', '🥉', '4', '5'];
                      return (
                        <div key={driver.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: '#0A0A0A' }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                            style={{ background: colors[index], color: index < 3 ? '#000' : '#fff' }}
                          >
                            {medals[index]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{driver.first_name} {driver.last_name}</p>
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                              <Star size={14} fill="currentColor" />
                              {driver.rating?.toFixed(2) || '5.00'}
                            </div>
                            <div className="flex gap-4 mt-1 text-xs text-gray-400">
                              <span>Viajes: {driver.trip_count}</span>
                              <span>Ingresos: Gs. {driver.total_revenue.toLocaleString('es-PY')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Viajes en Tiempo Real (Preview) */}
              <Card className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Radio size={20} className="text-[#FFD700]" />
                    Viajes en tiempo real
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveTrips.slice(0, 3).map((trip, index) => {
                      const statusConfig = theme.tripStatuses[trip.status] || {};
                      return (
                        <div key={trip.id} className="p-3 rounded-xl border border-[#1A1A1A]" style={{ background: '#0A0A0A' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">#{index + 1} - {trip.passenger_name}</p>
                              <p className="text-sm text-gray-400">{trip.driver_name || 'Sin conductor'}</p>
                            </div>
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: `${statusConfig.color}30`,
                                color: statusConfig.color
                              }}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {trip.pickup_address} → {trip.dropoff_address}
                          </p>
                          <p className="text-[#FFD700] font-bold text-right mt-2">
                            Gs. {(trip.final_price || trip.estimated_price).toLocaleString('es-PY')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveView('live')}
                    className="w-full mt-4 text-[#FFD700] hover:text-[#FFA500]"
                  >
                    Ver todos los viajes en vivo
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Vista Viajes en Vivo */}
        {activeView === 'live' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Radio size={28} className="text-[#FFD700]" />
                  Viajes en tiempo real
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </h2>
                <p className="text-gray-400 mt-1">{liveTrips.length} viajes activos</p>
              </div>
            </div>

            <div className="space-y-4">
              {liveTrips.map((trip, index) => {
                const statusConfig = theme.tripStatuses[trip.status] || {};
                return (
                  <Card key={trip.id} className="bg-black border-[#FFD700]/20 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-xl" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
                          <Car size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-lg font-bold text-white">#{index + 1} - {trip.passenger_name}</p>
                              <p className="text-sm text-gray-400">{trip.driver_name || 'Buscando conductor...'}</p>
                            </div>
                            <Badge
                              className="text-sm px-3 py-1"
                              style={{
                                backgroundColor: `${statusConfig.color}30`,
                                color: statusConfig.color,
                                border: `1px solid ${statusConfig.color}50`
                              }}
                            >
                              {statusConfig.icon} {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin size={16} className="text-[#FFD700]" />
                              <span className="text-sm">{trip.pickup_address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin size={16} className="text-[#FFD700]" />
                              <span className="text-sm">{trip.dropoff_address}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm">
                              <span className="text-gray-400">
                                {trip.estimated_distance?.toFixed(1) || 0} km
                              </span>
                              <span className="text-gray-400">
                                {trip.estimated_duration || 0} min
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-[#FFD700]">
                              Gs. {(trip.final_price || trip.estimated_price).toLocaleString('es-PY')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista Analíticas */}
        {activeView === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp size={28} className="text-[#FFD700]" />
                Analíticas Avanzadas
              </h2>
              <p className="text-gray-400 mt-1">Análisis detallado de la plataforma</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mapa de Demanda (Placeholder) */}
              <Card className="bg-black border-[#FFD700]/20 gold-border lg:col-span-2" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
                <CardHeader>
                  <CardTitle className="text-white">Mapa de demanda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="text-[#FFD700] mx-auto mb-4" />
                      <p className="text-gray-400">Mapa de calor de demanda</p>
                      <p className="text-sm text-gray-500 mt-2">Zonas con mayor actividad en tiempo real</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-8 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-400">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full" />
                      <span className="text-sm text-gray-400">Alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full" />
                      <span className="text-sm text-gray-400">Muy alta</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
