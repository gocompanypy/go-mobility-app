import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, formatCurrency } from '@/lib/utils';
import { Power, Menu, DollarSign, Star, Navigation, MapPin, ChevronRight, TrendingUp, Coffee, Bell, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Logo from '@/components/go/Logo';
import LiveMap from '@/components/go/LiveMap';
import TripStatusCard from '@/components/go/TripStatusCard';
import DriverRequestCard from '@/components/go/DriverRequestCard';
import RatingModal from '@/components/go/RatingModal';
import ChatPanel from '@/components/go/ChatPanel';
import { theme } from '@/components/go/theme';
import { toast } from 'sonner';

export default function DriverHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMissing, setIsProfileMissing] = useState(false);

  // Trip states
  const [pendingRequest, setPendingRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats
  const [todayStats, setTodayStats] = useState({ trips: 0, earnings: 0 });

  useEffect(() => {
    loadDriverData();
  }, []);

  // Location Broadcaster
  useEffect(() => {
    let interval = null;
    if (isOnline && !activeTrip) { // Only broadcast when online/available
      interval = setInterval(async () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              await goApp.entities.Driver.updateLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.heading || 0);
            } catch (e) { console.error("Location broadcast error", e); }
          });
        }
      }, 10000); // Every 10s
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isOnline, activeTrip]);

  // Real-time Request Listener
  useEffect(() => {
    let subscription = null;
    if (isOnline && !activeTrip && driver) {
      // Listen for any NEW trip with searching status and matching vehicle type
      subscription = goApp.supabase
        .channel('new-requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'trips',
          filter: `status=eq.searching`
        }, (payload) => {
          if (payload.new.vehicle_type === driver.vehicle_type) {
            setPendingRequest(payload.new);
          }
        })
        .subscribe();
    }
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [isOnline, !!activeTrip, driver?.vehicle_type]);

  useEffect(() => {
    let subscription = null;
    if (activeTrip?.id) {
      subscription = goApp.subscriptions.trip(activeTrip.id, (newTrip) => {
        // Solo actualizamos si el estado o datos clave han cambiado para evitar bucles
        if (newTrip.status !== activeTrip?.status || newTrip.driver_id !== activeTrip?.driver_id) {
          setActiveTrip(newTrip);
        }

        if (newTrip.status === 'completed' && !newTrip.driver_rating) {
          setShowRating(true);
        }
        if (['cancelled_passenger', 'cancelled_driver'].includes(newTrip.status)) {
          handleTripEnd();
        }
      });
    }
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [activeTrip?.id]);

  const handleTripEnd = async () => {
    setActiveTrip(null);
    if (driver) {
      await goApp.entities.Driver.update(driver.id, { is_available: true });
    }
  };

  const loadDriverData = async () => {
    try {
      const currentUser = await goApp.auth.me();
      setUser(currentUser);

      // Check for existing driver profile
      const drivers = await goApp.entities.Driver.filter({ id: currentUser.id });

      if (drivers.length > 0) {
        setDriver(drivers[0]);
        // Check for active trip
        const trips = await goApp.entities.Trip.filter({
          driver_id: drivers[0].id,
          status: ['accepted', 'arrived', 'in_progress']
        });
        if (trips.length > 0) {
          setActiveTrip(trips[0]);
        }
        loadTodayStats(drivers[0].id);
      } else {
        // En lugar de redirigir inmediatamente, marcamos que falta el perfil
        // Esto rompe el bucle si la redirección fallara por alguna razón
        console.warn('Driver profile not found for authenticated user');
        setIsProfileMissing(true);
      }
    } catch (error) {
      console.error('Error loading driver:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayStats = async (driverId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const trips = await goApp.entities.Trip.filter({
        driver_id: driverId,
        status: 'completed'
      });

      const todayTrips = trips.filter(t => new Date(t.completed_at) >= today);
      const earnings = todayTrips.reduce((sum, t) => sum + (t.final_price || t.estimated_price || 0), 0);

      setTodayStats({
        trips: todayTrips.length,
        earnings: earnings * 0.8 // 80% for driver
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleOnline = async () => {
    if (!driver) return;

    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      await goApp.entities.Driver.update(driver.id, {
        is_online: newStatus,
        is_available: newStatus,
      });
      if (newStatus) {
        toast.success('¡Ahora estás disponible para recibir viajes! ✨🚕');
      } else {
        toast('Has pasado a modo desconectado.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setIsOnline(!newStatus);
    }
  };

  const acceptRequest = async () => {
    if (!pendingRequest || !driver) return;

    try {
      await goApp.entities.Trip.update(pendingRequest.id, {
        status: 'accepted',
        driver_id: driver.id,
        driver_name: `${driver.first_name} ${driver.last_name}`,
        driver_phone: driver.phone,
        accepted_at: new Date().toISOString(),
      });

      setActiveTrip({ ...pendingRequest, status: 'accepted', driver_id: driver.id });
      setPendingRequest(null);

      await goApp.entities.Driver.update(driver.id, { is_available: false });
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async () => {
    setPendingRequest(null);
  };


  const updateTripStatus = async (newStatus) => {
    if (!activeTrip) return;

    const updates = { status: newStatus };

    if (newStatus === 'arrived') {
      updates.arrived_at = new Date().toISOString();
    } else if (newStatus === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.final_price = activeTrip.estimated_price;
      updates.payment_status = 'completed';
    }

    try {
      await goApp.entities.Trip.update(activeTrip.id, updates);

      if (newStatus === 'completed') {
        await goApp.entities.Driver.update(driver.id, {
          is_available: true,
          total_trips: (driver.total_trips || 0) + 1,
          total_earnings: (driver.total_earnings || 0) + (activeTrip.estimated_price * 0.8)
        });
        setShowRating(true);
      }

      setActiveTrip(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const cancelTrip = async () => {
    if (!activeTrip) return;

    try {
      await goApp.entities.Trip.update(activeTrip.id, {
        status: 'cancelled_driver',
        cancelled_by: 'driver',
      });

      await goApp.entities.Driver.update(driver.id, { is_available: true });
      setActiveTrip(null);
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  const submitRating = async ({ rating, comment }) => {
    if (!activeTrip) return;

    try {
      await goApp.entities.Trip.update(activeTrip.id, {
        driver_rating: rating,
      });
      setShowRating(false);
      setActiveTrip(null);
      loadTodayStats(driver.id);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const getActionButton = () => {
    if (!activeTrip) return null;

    switch (activeTrip.status) {
      case 'accepted':
        return (
          <Button
            onClick={() => updateTripStatus('arrived')}
            className="w-full py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <MapPin className="text-black" strokeWidth={2.5} size={22} />
              Llegué al punto
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        );
      case 'arrived':
        return (
          <Button
            onClick={() => updateTripStatus('in_progress')}
            className="w-full py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Navigation className="text-black" strokeWidth={2.5} size={22} />
              Iniciar viaje
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            onClick={() => updateTripStatus('completed')}
            className="w-full py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <DollarSign className="text-black" strokeWidth={2.5} size={22} />
              Finalizar y Cobrar
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isProfileMissing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-[#FFD700]" />
          </div>
          <h2 className="text-3xl font-bold">Perfil Incompleto</h2>
          <p className="text-gray-400">Hemos detectado que tu cuenta no tiene un perfil de conductor asociado. Por favor, completa tu registro para empezar.</p>
          <Button
            onClick={() => navigate(createPageUrl('DriverRegister'))}
            className="w-full bg-[#FFD700] text-black font-bold h-14 rounded-xl"
          >
            Completar Registro
          </Button>
          <Button
            variant="ghost"
            onClick={() => goApp.auth.logout().then(() => navigate(createPageUrl('Home')))}
            className="w-full text-gray-500"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[1900] transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-b border-[#FFD700]/10" />

        <div className="relative flex items-center justify-between px-5 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </Button>

          {!isSidebarOpen && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Logo size="sm" />
            </div>
          )}

          {/* Online Toggle & Notifications */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            <div className={`flex items-center gap-3 px-1 py-1 rounded-full border transition-colors ${isOnline ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/5 border-white/10'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 transition-colors ${isOnline ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={toggleOnline}
                className="data-[state=checked]:bg-[#FFD700]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-screen pt-[72px]">
        {/* Custom Sidebar (Push Menu) */}
        <div
          className={`fixed left-0 top-0 bottom-0 w-80 bg-[#0A0A0A] border-r border-white/10 z-[2000] transition-transform duration-300 ease-out flex flex-col pt-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ boxShadow: '20px 0 50px rgba(0,0,0,0.5)' }}
        >
          <div className="px-6 mb-8 flex items-center justify-between">
            <Logo size="md" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" />
            </Button>
          </div>

          <div className="px-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-[#1A1A1A] to-black rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg relative overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFD700]/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-[#FFD700]/20 transition-all" />

              <div className="w-12 h-12 bg-[#252538] rounded-full flex items-center justify-center text-2xl border border-white/10 relative z-10">
                {theme.vehicleTypes[driver?.vehicle_type]?.icon || '🚗'}
              </div>
              <div className="relative z-10">
                <p className="font-bold text-white text-lg">{driver?.first_name} {driver?.last_name}</p>
                <div className="flex items-center gap-1 text-[#FFD700] text-sm font-medium bg-[#FFD700]/10 px-2 py-0.5 rounded-md inline-flex mt-1">
                  <Star size={12} fill="currentColor" />
                  {driver?.rating?.toFixed(1) || '5.0'}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => navigate(createPageUrl('DriverEarnings'))}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all group"
            >
              <span className="flex items-center gap-4 text-gray-300 group-hover:text-[#FFD700] transition-colors">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FFD700]/20 transition-colors">
                  <DollarSign size={20} />
                </div>
                <span className="font-medium">Mis ganancias</span>
              </span>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />
            </button>
            <button
              onClick={() => navigate(createPageUrl('DriverHistory'))}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all group"
            >
              <span className="flex items-center gap-4 text-gray-300 group-hover:text-[#FFD700] transition-colors">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FFD700]/20 transition-colors">
                  <TrendingUp size={20} />
                </div>
                <span className="font-medium">Historial de viajes</span>
              </span>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />
            </button>
            <button
              onClick={() => navigate(createPageUrl('DriverDigitalId'))}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all group"
            >
              <span className="flex items-center gap-4 text-gray-300 group-hover:text-[#FFD700] transition-colors">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FFD700]/20 transition-colors">
                  <CreditCard size={20} />
                </div>
                <span className="font-medium">Credencial Digital</span>
              </span>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />
            </button>
          </nav>

          <div className="p-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">v1.2.0 • GO Conductor</p>
          </div>
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} relative`}>

          {/* Floating Quick Stats - Only visible when online and idle */}
          {isOnline && !activeTrip && !pendingRequest && (
            <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-[#FFD700]/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#FFD700]/20 blur-xl rounded-full -mr-6 -mt-6" />
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Viajes Hoy</p>
                <p className="text-2xl font-black text-white">{todayStats.trips}</p>
              </div>
              <div className="bg-gradient-to-br from-[#FFD700]/10 to-black/80 backdrop-blur-md rounded-2xl p-4 border border-[#FFD700]/40 shadow-lg relative overflow-hidden group">
                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-1">Ganado Hoy</p>
                <p className="text-2xl font-black text-[#FFD700]">{formatCurrency(todayStats.earnings)}</p>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="flex-1 relative bg-[#0A0A0A]">
            <LiveMap
              pickupLat={activeTrip?.pickup_lat}
              pickupLng={activeTrip?.pickup_lng}
              dropoffLat={activeTrip?.dropoff_lat}
              dropoffLng={activeTrip?.dropoff_lng}
              driverLat={driver?.current_lat}
              driverLng={driver?.current_lng}
              className="w-full h-full"
            />

            {/* Gradient Fade to connect map with bottom panel smoothly */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            {/* Offline / Pending Overlay */}
            {!activeTrip && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                {driver?.status === 'pending' ? (
                  <div className="bg-black/80 p-8 rounded-[32px] border border-[#FFD700]/20 max-w-sm text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck size={40} className="text-[#FFD700] animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Cuenta en revisión</h3>
                    <p className="text-gray-400">
                      ¡Hola {driver?.first_name}! Estamos verificando tus documentos. Te notificaremos en cuanto puedas empezar a conducir. 🚀
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(createPageUrl('Home'))}
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        Volver al inicio
                      </Button>
                    </div>
                  </div>
                ) : !isOnline ? (
                  <>
                    <div className="relative mb-8 group cursor-pointer" onClick={toggleOnline}>
                      <div className="absolute inset-0 bg-[#FFD700] rounded-full opacity-20 animate-ping duration-[3s]" />
                      <div className="absolute inset-[-20px] bg-[#FFD700] rounded-full opacity-10 blur-xl group-hover:opacity-30 transition-opacity" />
                      <div className="w-24 h-24 bg-[#1A1A1A] rounded-full border-4 border-[#333] group-hover:border-[#FFD700] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105 active:scale-95">
                        <Power size={36} className="text-gray-500 group-hover:text-[#FFD700] transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Estás desconectado</h3>
                    <p className="text-gray-400 text-center max-w-xs leading-relaxed">
                      Toca el botón para conectarte y empezar a recibir solicitudes de viaje.
                    </p>
                  </>
                ) : (
                  <div className="text-center animate-pulse">
                    <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Navigation size={32} className="text-[#FFD700]" />
                    </div>
                    <p className="text-[#FFD700] font-medium tracking-widest uppercase text-sm">Buscando solicitudes...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Active Trip Panel */}
          {activeTrip && (
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-black rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#FFD700]/20 overflow-hidden animate-in slide-in-from-bottom duration-500">
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-gray-800" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-4">
                <TripStatusCard
                  trip={activeTrip}
                  userType="driver"
                  onCancel={cancelTrip}
                  onChat={() => setShowChat(true)}
                  onCall={() => alert('Función de llamada próximamente')}
                />

                {getActionButton()}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pending Request Overlay */}
      {pendingRequest && (
        <DriverRequestCard
          trip={pendingRequest}
          onAccept={acceptRequest}
          onReject={rejectRequest}
        />
      )}

      {/* Chat Panel */}
      <ChatPanel
        tripId={activeTrip?.id}
        currentUserId={driver?.id}
        currentUserName={`${driver?.first_name} ${driver?.last_name}`}
        currentUserType="driver"
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Rating Modal */}
      <RatingModal
        open={showRating}
        onClose={() => {
          setShowRating(false);
          setActiveTrip(null);
        }}
        onSubmit={submitRating}
        targetName={activeTrip?.passenger_name || 'Pasajero'}
        targetType="passenger"
      />
    </div>
  );
}