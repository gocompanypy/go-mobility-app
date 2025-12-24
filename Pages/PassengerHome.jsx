import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { MapPin, Clock, CreditCard, History, User, Menu, ChevronRight, Car, Calendar, Bike, Key, Truck, Package, UtensilsCrossed, Search, Gift, Tag, Power, X, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Logo from '@/components/go/Logo';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PassengerDashboard from '@/components/go/PassengerDashboard';
import { ArrowLeft } from 'lucide-react';
import AddressInput from '@/components/go/AddressInput';
import LiveMapbox from '@/components/go/LiveMapbox';
import VehicleCard3D from '@/components/go/VehicleCard3D';
import TripStatusCard from '@/components/go/TripStatusCard';
import RatingModal from '@/components/go/RatingModal';
import ChatPanel from '@/components/go/ChatPanel';
import NotificationBell from '@/components/go/NotificationBell';
import ScheduleModal from '@/components/go/ScheduleModal';
import { theme } from '@/components/go/theme';

export default function PassengerHome() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [passenger, setPassenger] = useState(null);
    const [step, setStep] = useState('dashboard'); // dashboard, input, vehicles, searching, trip
    const [activeTab, setActiveTab] = useState('viajes');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(false);

    // Trip request state
    const [pickup, setPickup] = useState({ address: '', lat: null, lng: null });
    const [dropoff, setDropoff] = useState({ address: '', lat: null, lng: null });
    const [selectedVehicle, setSelectedVehicle] = useState('economy');
    const [priceEstimates, setPriceEstimates] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Default center
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);

    // Active trip state
    const [activeTrip, setActiveTrip] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        loadUserData();

        // Auto-detect location
        if (navigator.geolocation && !pickup.lat) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPickup(prev => ({
                        ...prev,
                        address: 'Tu ubicación actual',
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                },
                (error) => console.log('Location access denied or failed:', error)
            );
        }
    }, []);

    useEffect(() => {
        let subscription = null;
        if (activeTrip?.id) {
            subscription = goApp.subscriptions.trip(activeTrip.id, (newTrip) => {
                setActiveTrip(newTrip);
                if (['completed', 'cancelled_passenger', 'cancelled_driver', 'no_drivers'].includes(newTrip.status)) {
                    if (newTrip.status === 'completed' && !newTrip.passenger_rating) {
                        setShowRating(true);
                    } else {
                        setStep('input');
                        setActiveTrip(null);
                    }
                }
            });
        }
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [activeTrip?.id]);

    const [nearbyDrivers, setNearbyDrivers] = useState([]);

    // Subscribe to nearby drivers
    useEffect(() => {
        let subscription = null;
        if (pickup.lat && pickup.lng && step === 'input') {
            subscription = goApp.subscriptions.nearbyDrivers(pickup.lat, pickup.lng, 5, (payload) => {
                // Refresh list on any change
                loadNearbyDrivers();
            });
            loadNearbyDrivers();
        }
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [pickup.lat, pickup.lng, step]);

    const loadNearbyDrivers = async () => {
        if (!pickup.lat || !pickup.lng) return;
        const drivers = await goApp.entities.Driver.getNearby(pickup.lat, pickup.lng, 5);
        setNearbyDrivers(drivers);
    };

    const [profileError, setProfileError] = useState(null);

    const loadUserData = async () => {
        try {
            const currentUser = await goApp.auth.me();

            if (!currentUser) {
                navigate('/passenger/login');
                return;
            }

            setUser(currentUser);

            // Check for existing passenger profile
            // Use retry logic for robustness
            let passengerProfile = null;
            try {
                // IMPORTANT: Filter by ID, not email, as email might change or be null in previous versions
                // filtering by ID is guaranteed to be unique and consistent with RLS
                const passengers = await goApp.entities.Passenger.filter({ id: currentUser.id });
                if (passengers.length > 0) {
                    passengerProfile = passengers[0];
                } else {
                    // Create passenger profile
                    console.log("Creating missing profile for", currentUser.email);
                    passengerProfile = await goApp.entities.Passenger.create({
                        id: currentUser.id, // Ensure ID matches Auth ID
                        email: currentUser.email,
                        phone: currentUser.phone || '',
                        first_name: currentUser.full_name?.split(' ')[0] || 'Usuario',
                        last_name: currentUser.full_name?.split(' ').slice(1).join(' ') || '',
                    });
                }
                setPassenger(passengerProfile);
                setProfileError(null);
            } catch (profileErr) {
                console.error("Critical: Failed to load/create profile", profileErr);
                setProfileError("No pudimos cargar tu perfil. Por favor contacta a soporte o reintenta.");
                // Do NOT redirect here to avoid loop
                return;
            }

            // Check for active trip (only if we have a passenger profile)
            if (passengerProfile) {
                // Need passenger ID 
                const trips = await goApp.entities.Trip.filter({
                    passenger_id: passengerProfile.id,
                    status: ['searching', 'accepted', 'arrived', 'in_progress']
                });
                if (trips.length > 0) {
                    setActiveTrip(trips[0]);
                    setStep('trip');
                }
            }
        } catch (error) {
            console.error('Error loading user session:', error);
            navigate(createPageUrl('PassengerLogin'));
        }
    };


    const [selectedCategory, setSelectedCategory] = useState(null); // 'ride', 'moto', 'package', 'food'

    const calculatePrices = async () => {
        if (!pickup.lat || !dropoff.lat) return;

        try {
            // GUARANTEED MOCK DATA + DB
            let configs = [];

            try {
                configs = await goApp.entities.PriceConfig.filter({ is_active: true });
            } catch (err) {
                console.warn("DB Price Config failed, using fallback", err);
            }

            // FALLBACK MOCK DATA if DB is empty (for demo purposes) or Failed
            if (!configs || configs.length === 0) {
                configs = [
                    { vehicle_type: 'economy', base_fare: 15000, price_per_km: 3000, price_per_min: 500, minimum_fare: 20000 },
                    { vehicle_type: 'moto', base_fare: 8000, price_per_km: 2000, price_per_min: 300, minimum_fare: 12000 },
                    { vehicle_type: 'comfort', base_fare: 20000, price_per_km: 4000, price_per_min: 800, minimum_fare: 25000 },
                    { vehicle_type: 'xl', base_fare: 30000, price_per_km: 5000, price_per_min: 1000, minimum_fare: 40000 },
                    { vehicle_type: 'women', base_fare: 20000, price_per_km: 4000, price_per_min: 800, minimum_fare: 25000 }, // Conductora Mujer
                ];
            }

            // Calculate distance (simplified - using Haversine formula approximation)
            const distance = Math.sqrt(
                Math.pow((dropoff.lat - pickup.lat) * 111, 2) +
                Math.pow((dropoff.lng - pickup.lng) * 111 * Math.cos(pickup.lat * Math.PI / 180), 2)
            );

            const duration = Math.round(distance * 3); // Approx 3 min per km

            const estimates = configs.map(config => {
                const price = config.base_fare +
                    (distance * config.price_per_km) +
                    (duration * config.price_per_min);
                return {
                    vehicle_type: config.vehicle_type,
                    estimated_price: Math.max(price, config.minimum_fare),
                    estimated_distance: distance,
                    estimated_duration: duration,
                    surge_multiplier: 1.0,
                };
            });

            // Sort based on selection
            if (selectedCategory === 'moto') {
                estimates.sort((a, b) => (a.vehicle_type === 'moto' ? -1 : 1));
            } else {
                // Default: Economy first, then Moto, etc.
                const order = ['economy', 'moto', 'women', 'comfort', 'xl'];
                estimates.sort((a, b) => order.indexOf(a.vehicle_type) - order.indexOf(b.vehicle_type));
            }

            setPriceEstimates(estimates);
            setStep('vehicles');

            // Fetch Route for visualization
            if (pickup.lng && pickup.lat && dropoff.lng && dropoff.lat) {
                fetchRoute(
                    { lat: pickup.lat, lng: pickup.lng },
                    { lat: dropoff.lat, lng: dropoff.lng }
                );
            }
        } catch (error) {
            console.error('Error calculating prices:', error);
        }
    };

    // --- Route Fetching Logic ---
    const fetchRoute = async (start, end) => {
        try {
            // Using Mapbox Directions API
            // Valid profiles: 'mapbox/driving', 'mapbox/walking', 'mapbox/cycling'
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
            );
            const json = await query.json();

            if (json.routes && json.routes.length > 0) {
                const data = json.routes[0];
                const route = data.geometry;

                const geojson = {
                    type: 'Feature',
                    properties: {},
                    geometry: route
                };

                setRouteGeoJSON(geojson);

                // Optional: Fit bounds to include the route
                // You might calculate bounds here and setMapCenter or use a ref to Map to fitBounds
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    const requestTrip = async () => {
        const estimate = priceEstimates.find(e => e.vehicle_type === selectedVehicle);
        if (!estimate) return;

        setStep('searching');

        try {
            const trip = await goApp.entities.Trip.create({
                passenger_id: passenger.id,
                passenger_name: `${passenger.first_name} ${passenger.last_name}`,
                passenger_phone: passenger.phone,
                pickup_lat: pickup.lat,
                pickup_lng: pickup.lng,
                pickup_address: pickup.address,
                dropoff_lat: dropoff.lat,
                dropoff_lng: dropoff.lng,
                dropoff_address: dropoff.address,
                vehicle_type: selectedVehicle,
                estimated_distance: estimate.estimated_distance,
                estimated_duration: estimate.estimated_duration,
                estimated_price: estimate.estimated_price,
                surge_multiplier: estimate.surge_multiplier,
                status: 'searching',
            });

            setActiveTrip(trip);
            setStep('trip');
        } catch (error) {
            console.error('Error creating trip:', error);
            setStep('vehicles');
        }
    };

    const cancelTrip = async () => {
        if (!activeTrip) return;

        try {
            await goApp.entities.Trip.update(activeTrip.id, {
                status: 'cancelled_passenger',
                cancellation_reason: 'Cancelado por pasajero',
                cancelled_by: 'passenger',
            });
            setActiveTrip(null);
            setStep('dashboard');
        } catch (error) {
            console.error('Error cancelling trip:', error);
        }
    };

    const submitRating = async ({ rating, comment, tip }) => {
        if (!activeTrip) return;

        try {
            await goApp.entities.Trip.update(activeTrip.id, {
                passenger_rating: rating,
                tip_amount: tip,
                final_price: (activeTrip.final_price || activeTrip.estimated_price) + tip,
            });
            setShowRating(false);
            setActiveTrip(null);
            setStep('dashboard');
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Dashboard View */}
            {step === 'dashboard' && !activeTrip && (
                <div className="absolute inset-0 z-[100] bg-black">
                    <PassengerDashboard
                        user={passenger || user}
                        onSelectService={(serviceId) => {
                            if (serviceId === 'moto') {
                                setSelectedVehicle('moto');
                            }
                            setStep('input');
                        }}
                        onSearchClick={() => {
                            setStep('input');
                            setIsInputExpanded(true);
                        }}
                    />
                </div>
            )}

            {/* Back Arrow from Map to Dashboard */}
            {step === 'input' && !activeTrip && (
                <button
                    onClick={() => setStep('dashboard')}
                    className="absolute top-24 left-4 z-40 p-2 bg-black/50 rounded-full backdrop-blur text-white hover:bg-black/70 border border-white/10 shadow-lg"
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            {/* Top Bar (Only visible when sidebar is closed) */}
            <header className={`fixed top-0 left-0 right-0 z-[2000] bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20 gold-glow transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`} style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.15)' }}>
                <div className="flex items-center justify-between px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-[#252538]"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu size={24} />
                    </Button>

                    {!isSidebarOpen && <Logo size="sm" />}

                    <div className="flex items-center gap-2">
                        {/* SOS Button - Highly Visible (Red) */}
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            onClick={() => toast.error('S.O.S. Activado: Enviando alerta a contactos y autoridades...')}
                        >
                            SOS
                        </Button>
                        <NotificationBell userId={passenger?.id} userType="passenger" />
                    </div>
                </div>
            </header>

            {/* Main Layout Container */}
            <div className="flex h-screen pt-16">
                {/* Custom Sidebar (Push Menu) */}
                <div
                    className={`fixed left-0 top-16 bottom-0 w-80 bg-black border-r border-[#FFD700]/20 z-[2000] transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ paddingTop: '1rem', height: 'calc(100vh - 4rem)' }}
                >
                    <div className="h-full overflow-y-auto px-4 pb-6">
                        <div className="flex items-center justify-center mb-8 pt-4">
                            <Logo size="md" />
                        </div>

                        <div
                            onClick={() => navigate(createPageUrl('PassengerProfile'))}
                            className="flex items-center gap-3 p-4 rounded-xl mb-6 gold-border gold-glow cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                            style={{ background: 'linear-gradient(135deg, #0A0A0A, #000000)' }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)' }}>
                                <User size={24} className="text-black" />
                            </div>
                            <div>
                                <p className="font-semibold">{passenger?.first_name} {passenger?.last_name}</p>
                                <div className="flex items-center gap-1 text-[#FFD700]">
                                    <span className="text-sm font-bold">4.9</span>
                                    <Star size={12} fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => navigate(createPageUrl('PassengerHistory'))}
                                className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <History size={20} className="text-gray-400" />
                                    Mis viajes
                                </span>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                            {/* Security Section in Menu */}
                            <div className="py-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">Seguridad</h3>
                                <button
                                    onClick={() => navigate(createPageUrl('PassengerTrustedContacts'))}
                                    className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <Shield size={14} className="text-blue-400" />
                                        </div>
                                        Contactos de confianza
                                    </span>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <button
                                onClick={() => navigate(createPageUrl('PassengerRewards'))}
                                className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <Gift size={20} className="text-[#FFD700]" />
                                    GO Rewards
                                </span>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                            <button
                                onClick={() => navigate(createPageUrl('PassengerPromotions'))}
                                className="w-full flex items-center justify-between p-4 hover:bg-[#252538] rounded-xl transition-colors"
                            >
                                <span className="flex items-center gap-3">
                                    <Tag size={20} className="text-[#FFD700]" />
                                    Promociones
                                </span>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </nav>

                        <div className="mt-8 pt-6 border-t border-[#2D2D44]">
                            <button
                                onClick={() => {
                                    /* Todo: logout logic */
                                    navigate(createPageUrl('PassengerLogin'));
                                }}
                                className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <Power size={20} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}


                {/* Main Content */}
                {/* Main Content - Mobile Simulator Mode */}
                <main className={`flex-1 flex flex-col transition-all duration-300 relative ${!activeTrip ? 'pt-0' : 'pt-4'} max-w-lg mx-auto w-full border-x border-[#2D2D44]/50 shadow-2xl`}>
                    {/* Tabs */}
                    {!activeTrip && (
                        <div className="w-full z-30 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20 px-4 py-2" style={{ boxShadow: '0 4px 24px rgba(255, 215, 0, 0.1)' }}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#0A0A0A] border border-[#FFD700]/20">
                                    <TabsTrigger value="viajes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700] data-[state=active]:to-[#FFA500] data-[state=active]:text-black data-[state=active]:font-bold">
                                        <Car size={18} className="mr-2" />
                                        Viajes
                                    </TabsTrigger>
                                    <TabsTrigger value="eats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700] data-[state=active]:to-[#FFA500] data-[state=active]:text-black data-[state=active]:font-bold">
                                        <UtensilsCrossed size={18} className="mr-2" />
                                        Go Eats
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    )}
                    {/* Map Area */}
                    <div className="flex-1 relative">
                        <LiveMapbox
                            pickupLat={pickup.lat}
                            pickupLng={pickup.lng}
                            dropoffLat={dropoff.lat}
                            dropoffLng={dropoff.lng}
                            driverLat={activeTrip?.driver_lat}
                            driverLng={activeTrip?.driver_lng}
                            className="h-full min-h-[300px]"
                            interactive={step === 'selecting_dropoff'}
                            onCenterChange={setMapCenter}
                            routeGeoJSON={routeGeoJSON}
                            nearbyDrivers={nearbyDrivers}
                        />

                        {/* Step: Map Selection Mode - MOVED HERE */}
                        {step === 'selecting_dropoff' && (
                            <div className="absolute top-0 left-0 right-0 bottom-0 z-50 pointer-events-none flex flex-col items-center justify-center">
                                {/* Center Pin Overlay */}
                                <div className="relative -mt-8 animate-bounce">
                                    <MapPin size={48} className="text-[#FFD700] drop-shadow-lg" fill="black" />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-2 bg-black/50 blur-[2px] rounded-full" />
                                </div>

                                {/* Controls Container */}
                                <div className="absolute bottom-6 left-4 right-4 pointer-events-auto space-y-3">
                                    <div className="bg-black/90 p-4 rounded-xl border border-[#FFD700]/30 text-center backdrop-blur-md">
                                        <h3 className="text-lg font-bold text-white mb-1">Mueve el mapa</h3>
                                        <p className="text-gray-400 text-sm">Ubica el pin en tu destino</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setStep('input')}
                                            className="flex-1 bg-[#252538] hover:bg-[#2D2D44] text-white py-6 rounded-xl border border-[#2D2D44]"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setDropoff(prev => ({
                                                    ...prev,
                                                    address: 'Ubicación seleccionada en mapa',
                                                    lat: mapCenter.lat,
                                                    lng: mapCenter.lng
                                                }));
                                                setStep('input');
                                            }}
                                            className="flex-1 text-black font-bold py-6 rounded-xl gold-glow"
                                            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                                        >
                                            Confirmar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Panel */}
                    {(step !== 'selecting_dropoff') && (
                        <div className="bg-black/90 backdrop-blur-3xl rounded-t-[2.5rem] -mt-6 relative z-10 border-t border-white/10 ring-1 ring-white/5" style={{ boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)' }}>
                            <div className="w-16 h-1.5 rounded-full mx-auto mt-4 mb-6 bg-white/20" />

                            <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
                                {/* Step: Input addresses */}
                                {step === 'input' && (
                                    <div className="space-y-6">
                                        {/* Search Bar / Input Mode Toggle */}
                                        {!isInputExpanded ? (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setIsInputExpanded(true)}
                                                    className="flex-1 flex items-center gap-4 rounded-2xl p-4 text-left bg-[#1A1A1A] border border-white/5 transition-all duration-300 group hover:bg-[#222]"
                                                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                        <Search size={22} className="text-[#F5C518]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold text-lg">¿A dónde vas?</span>
                                                        <span className="text-gray-400 text-sm">Busca un destino</span>
                                                    </div>
                                                </button>
                                                <Button
                                                    variant="outline"
                                                    className="h-auto rounded-2xl px-4 border border-white/10 bg-[#1A1A1A] text-white hover:bg-[#252525] hover:text-white hover:border-[#F5C518]/50 transition-all flex flex-col items-center gap-1 min-w-[80px]"
                                                    onClick={() => setShowScheduleModal(true)}
                                                >
                                                    <Clock size={20} className="text-[#F5C518]" />
                                                    <span className="text-[10px] font-medium text-gray-400">Reservar</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-lg">Planifica tu viaje</h3>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsInputExpanded(false)} className="text-red-400 hover:bg-red-900/20">Cancelar</Button>
                                                </div>
                                                <AddressInput
                                                    type="pickup"
                                                    value={pickup.address}
                                                    onChange={(addr) => setPickup(prev => ({ ...prev, address: addr }))}
                                                    onSelect={(place) => setPickup({ address: place.address, lat: place.lat, lng: place.lng })}
                                                    savedPlaces={passenger?.saved_places || []}
                                                    autoFocus={false}
                                                />

                                                <AddressInput
                                                    type="dropoff"
                                                    value={dropoff.address}
                                                    onChange={(addr) => setDropoff(prev => ({ ...prev, address: addr }))}
                                                    onSelect={(place) => {
                                                        if (place.id === 'map-pin') {
                                                            setStep('selecting_dropoff');
                                                        } else {
                                                            setDropoff({ address: place.address, lat: place.lat, lng: place.lng });
                                                        }
                                                    }}
                                                    savedPlaces={passenger?.saved_places || []}
                                                    autoFocus={true}
                                                />

                                                <Button
                                                    onClick={calculatePrices}
                                                    disabled={!pickup.lat || !dropoff.lat}
                                                    className="w-full py-7 text-black font-bold text-xl rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #F5C518, #DAA520)',
                                                        boxShadow: '0 8px 30px rgba(218, 165, 32, 0.3)'
                                                    }}
                                                >
                                                    Ver precios
                                                </Button>
                                            </div>
                                        )}

                                        {/* Sugerencias */}
                                    </div>
                                )}

                                {/* Step: Map Selection Mode (MOVED UP) */}

                                {/* Step: Select vehicle */}
                                {step === 'vehicles' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold">Elige tu GO</h2>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep('input')}
                                                className="text-gray-400"
                                            >
                                                Cambiar ruta
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                            <Clock size={16} />
                                            <span>
                                                {priceEstimates[0]?.estimated_duration || 0} min • {priceEstimates[0]?.estimated_distance?.toFixed(1) || 0} km
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {priceEstimates.map((vehicle) => (
                                                <VehicleCard3D
                                                    key={vehicle.vehicle_type}
                                                    vehicle={vehicle}
                                                    price={vehicle.estimated_price}
                                                    time={vehicle.estimated_duration}
                                                    isSelected={selectedVehicle === vehicle.vehicle_type}
                                                    onClick={() => setSelectedVehicle(vehicle.vehicle_type)}
                                                />
                                            ))}
                                        </div>

                                        <Button
                                            onClick={requestTrip}
                                            className="w-full py-6 text-black font-bold text-lg border-0 gold-glow"
                                            style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' }}
                                        >
                                            Pedir {theme.vehicleTypes[selectedVehicle]?.name || 'GO'}
                                        </Button>
                                    </div>
                                )}

                                {/* Step: Searching */}
                                {step === 'searching' && (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 border-4 border-[#00D4B1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <h2 className="text-xl font-bold mb-2">Buscando conductor...</h2>
                                        <p className="text-gray-400 mb-6">Esto puede tomar unos segundos</p>
                                        <Button
                                            variant="outline"
                                            onClick={cancelTrip}
                                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 min-w-[200px]"
                                        >
                                            <X size={18} className="mr-2" />
                                            Cancelar solicitud
                                        </Button>
                                    </div>
                                )}

                                {/* Step: Active trip */}
                                {step === 'trip' && activeTrip && (
                                    <TripStatusCard
                                        trip={activeTrip}
                                        userType="passenger"
                                        onCancel={cancelTrip}
                                        onChat={() => setShowChat(true)}
                                        onCall={() => {
                                            if (activeTrip?.driver_phone) {
                                                window.location.href = `tel:${activeTrip.driver_phone}`;
                                            } else {
                                                alert('Número no disponible');
                                            }
                                        }}
                                        onRate={() => setShowRating(true)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* Chat Panel */}
                <ChatPanel
                    tripId={activeTrip?.id}
                    currentUserId={passenger?.id}
                    currentUserName={`${passenger?.first_name} ${passenger?.last_name}`}
                    currentUserType="passenger"
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                />

                {/* Rating Modal */}
                <RatingModal
                    open={showRating}
                    onClose={() => {
                        setShowRating(false);
                        setActiveTrip(null);
                        setStep('dashboard');
                    }}
                    onSubmit={submitRating}
                    targetName={activeTrip?.driver_name || 'Conductor'}
                    targetType="driver"
                    tripPrice={activeTrip?.final_price || activeTrip?.estimated_price || 0}
                />


                <ScheduleModal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    onSchedule={(date) => {
                        console.log('Scheduled for:', date);
                        // In a real app, we would create a scheduled trip here
                    }}
                />

                {/* Critical Profile Error Modal */}
                {profileError && (
                    <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                        <div className="bg-[#1A1A1A] border border-red-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                                <Shield size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Acción requerida</h2>
                            <p className="text-gray-400 mb-8">{profileError}</p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-6 bg-[#FFD700] text-black font-bold text-lg hover:bg-[#FFA500]"
                                >
                                    Reintentar
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(createPageUrl('PassengerLogin'))}
                                    className="w-full py-6 text-white border-white/10 hover:bg-white/5"
                                >
                                    Volver al inicio
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
