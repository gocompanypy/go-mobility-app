import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Power, Menu, DollarSign, Star, Navigation, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import Logo from '@/components/go/Logo';
import LiveMap from '@/components/go/LiveMap';
import TripStatusCard from '@/components/go/TripStatusCard';
import DriverRequestCard from '@/components/go/DriverRequestCard';
import RatingModal from '@/components/go/RatingModal';
import ChatPanel from '@/components/go/ChatPanel';
import { theme } from '@/components/go/theme';

export default function DriverHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Trip states
  const [pendingRequest, setPendingRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Stats
  const [todayStats, setTodayStats] = useState({ trips: 0, earnings: 0 });

  useEffect(() => {
    loadDriverData();
  }, []);

  useEffect(() => {
    if (isOnline && !activeTrip) {
      const interval = setInterval(checkForRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline, activeTrip]);

  useEffect(() => {
    if (activeTrip) {
      const interval = setInterval(refreshTrip, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTrip?.id]);

  const loadDriverData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check for existing driver profile
      const drivers = await base44.entities.Driver.filter({ created_by: currentUser.email });
      if (drivers.length > 0) {
        setDriver(drivers[0]);
        setIsOnline(drivers[0].is_online);

        // Check for active trip
        const trips = await base44.entities.Trip.filter({
          driver_id: drivers[0].id,
          status: ['accepted', 'arrived', 'in_progress']
        });
        if (trips.length > 0) {
          setActiveTrip(trips[0]);
        }

        // Load today's stats
        loadTodayStats(drivers[0].id);
      } else {
        // Redirect to registration
        navigate(createPageUrl('DriverRegister'));
      }
    } catch (error) {
      console.error('Error loading driver:', error);
    }
  };

  const loadTodayStats = async (driverId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const trips = await base44.entities.Trip.filter({
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
      await base44.entities.Driver.update(driver.id, {
        is_online: newStatus,
        is_available: newStatus,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setIsOnline(!newStatus);
    }
  };

  const checkForRequests = async () => {
    if (!driver || pendingRequest || activeTrip) return;

    try {
      const trips = await base44.entities.Trip.filter({
        status: 'searching',
        vehicle_type: driver.vehicle_type
      });

      if (trips.length > 0) {
        // Get the first available trip
        setPendingRequest(trips[0]);
      }
    } catch (error) {
      console.error('Error checking requests:', error);
    }
  };

  const acceptRequest = async () => {
    if (!pendingRequest || !driver) return;

    try {
      await base44.entities.Trip.update(pendingRequest.id, {
        status: 'accepted',
        driver_id: driver.id,
        driver_name: `${driver.first_name} ${driver.last_name}`,
        driver_phone: driver.phone,
        accepted_at: new Date().toISOString(),
      });

      setActiveTrip({ ...pendingRequest, status: 'accepted', driver_id: driver.id });
      setPendingRequest(null);

      await base44.entities.Driver.update(driver.id, { is_available: false });
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async () => {
    setPendingRequest(null);
  };

  const refreshTrip = async () => {
    if (!activeTrip?.id) return;
    try {
      const trips = await base44.entities.Trip.filter({ id: activeTrip.id });
      if (trips.length > 0) {
        setActiveTrip(trips[0]);
        if (trips[0].status === 'completed' && !trips[0].driver_rating) {
          setShowRating(true);
        }
        if (['cancelled_passenger', 'cancelled_driver'].includes(trips[0].status)) {
          setActiveTrip(null);
          await base44.entities.Driver.update(driver.id, { is_available: true });
        }
      }
    } catch (error) {
      console.error('Error refreshing trip:', error);
    }
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
      await base44.entities.Trip.update(activeTrip.id, updates);

      if (newStatus === 'completed') {
        await base44.entities.Driver.update(driver.id, {
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
      await base44.entities.Trip.update(activeTrip.id, {
        status: 'cancelled_driver',
        cancelled_by: 'driver',
      });

      await base44.entities.Driver.update(driver.id, { is_available: true });
      setActiveTrip(null);
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  const submitRating = async ({ rating, comment }) => {
    if (!activeTrip) return;

    try {
      await base44.entities.Trip.update(activeTrip.id, {
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
            className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
          >
            <MapPin className="mr-2" />
            Llegué al punto de recogida
          </Button>
        );
      case 'arrived':
        return (
          <Button
            onClick={() => updateTripStatus('in_progress')}
            className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
          >
            <Navigation className="mr-2" />
            Iniciar viaje
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            onClick={() => updateTripStatus('completed')}
            className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }}
          >
            <DollarSign className="mr-2" />
            Finalizar viaje
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b-2 border-[#FFD700]/20 gold-glow" style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.15)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black border-[#FFD700]/20 text-white w-80 gold-border" style={{ boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)' }}>
              <div className="py-6">
                <Logo size="md" className="mb-8" />

                <div className="flex items-center gap-3 p-4 bg-[#252538] rounded-xl mb-6">
                  <div className="w-12 h-12 bg-[#00D4B1]/20 rounded-full flex items-center justify-center text-2xl">
                    {theme.vehicleTypes[driver?.vehicle_type]?.icon || '🚗'}
                  </div>
                  <div>
                    <p className="font-semibold">{driver?.first_name} {driver?.last_name}</p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star size={12} fill="currentColor" />
                      {driver?.rating?.toFixed(1) || '5.0'}
                    </div>
                  </div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => navigate(createPageUrl('DriverEarnings'))}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <DollarSign size={20} className="text-gray-400" />
                      Mis ganancias
                    </span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate(createPageUrl('DriverHistory'))}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-gray-400" />
                      Historial de viajes
                    </span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Logo size="sm" />

          {/* Online Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isOnline ? 'text-[#00D4B1]' : 'text-gray-400'}`}>
              {isOnline ? 'En línea' : 'Desconectado'}
            </span>
            <Switch
              checked={isOnline}
              onCheckedChange={toggleOnline}
              className="data-[state=checked]:bg-[#00D4B1]"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-4 min-h-screen flex flex-col">
        {/* Today's Stats */}
        {!activeTrip && (
          <div className="px-4 py-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 gold-border" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
              <p className="text-gray-400 text-sm">Viajes hoy</p>
              <p className="text-2xl font-bold text-white">{todayStats.trips}</p>
            </div>
            <div className="rounded-xl p-4 gold-border gold-glow" style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}>
              <p className="text-gray-400 text-sm">Ganancias hoy</p>
              <p className="text-2xl font-bold text-[#FFD700]">€{todayStats.earnings.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 relative px-4">
          <LiveMap
            pickupLat={activeTrip?.pickup_lat}
            pickupLng={activeTrip?.pickup_lng}
            dropoffLat={activeTrip?.dropoff_lat}
            dropoffLng={activeTrip?.dropoff_lng}
            driverLat={driver?.current_lat}
            driverLng={driver?.current_lng}
            className="h-full min-h-[300px] rounded-xl"
          />

          {/* Offline Overlay */}
          {!isOnline && !activeTrip && (
            <div className="absolute inset-4 bg-black/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
              <Power size={48} className="text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Estás desconectado</h3>
              <p className="text-gray-400 text-center mb-4">Activa el modo en línea para recibir viajes</p>
              <Button
                onClick={toggleOnline}
                className="bg-[#00D4B1] hover:bg-[#00B89C] text-black"
              >
                Conectarse
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Panel - Active Trip */}
        {activeTrip && (
          <div className="bg-black rounded-t-3xl -mt-6 relative z-10 border-t-2 border-[#FFD700]/30 mx-4" style={{ boxShadow: '0 -4px 32px rgba(255, 215, 0, 0.2)' }}>
            <div className="w-12 h-1 rounded-full mx-auto mt-3 mb-4" style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)' }} />

            <div className="px-4 pb-6 space-y-4">
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

      {/* Pending Request Modal */}
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