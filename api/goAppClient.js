import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust initialization to prevent crash if .env is missing keys
let supabaseInstance;
if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error("⚠️ FATAL: Supabase environment variables are missing! Application will not fetch data.");
    // Mock minimal client to prevent runtime crash
    supabaseInstance = {
        auth: {
            getUser: async () => ({ data: { user: null }, error: { message: "Missing Supabase Config" } }),
            signInWithPassword: async () => ({ error: { message: "Missing Supabase Config" } }),
            signUp: async () => ({ error: { message: "Missing Supabase Config" } }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { message: "Missing Supabase Config" } }),
                    order: async () => ({ data: [], error: { message: "Missing Supabase Config" } })
                }),
                order: () => ({ data: [], error: { message: "Missing Supabase Config" } }),
                insert: async () => ({ error: { message: "Missing Supabase Config" } }),
                update: async () => ({ error: { message: "Missing Supabase Config" } }),
                delete: async () => ({ error: { message: "Missing Supabase Config" } }),
                in: () => ({ data: [], error: { message: "Missing Supabase Config" } }),
            })
        }),
        channel: () => ({
            on: function () { return this; },
            subscribe: function () { return this; }
        }),
        removeChannel: () => { }
    };
}

export const supabase = supabaseInstance;

export const goApp = {
    auth: {
        login: async (phone, password) => {
            // Generar email para Auth (Supabase Auth requiere email por defecto)
            const email = `${phone.replace(/\D/g, '')}@goapp.com`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login failed:", error);
                if (error.message.includes("Invalid login credentials")) {
                    throw new Error("Credenciales incorrectas. Verifica tu número y contraseña.");
                }
                throw error;
            }

            // Obtener perfil adicional
            // Primero intentamos buscar en drivers
            let { data: profile } = await supabase.from('drivers').select('*').eq('id', data.user.id).single();
            let role = 'driver';

            // Si no es conductor, buscamos en pasajeros
            if (!profile) {
                const { data: passengerProfile } = await supabase.from('passengers').select('*').eq('id', data.user.id).single();
                profile = passengerProfile;
                role = 'passenger';
            }

            // Si aun asi no tiene perfil (ej: usuario creado manualmente en Auth pero sin tabla),
            // podemos retornar un role 'guest' o lanzar error.
            if (!profile) {
                // Fallback temporal si no se creó la entrada en tablas publicas
                role = 'unknown';
            }

            return { user: data.user, profile, role };
        },
        register: async (phone, password, metadata = {}) => {
            const email = `${phone.replace(/\D/g, '')}@goapp.com`;

            const { data, error } = await supabase.auth.signUp({
                email,
                password: password,
                options: {
                    data: metadata, // full_name, role, etc.
                }
            });

            if (error) throw error;



            if (data.user) {
                // El Trigger de Supabase ('handle_new_user') se encargará de crear el perfil en 'public.drivers' o 'public.passengers'.
                // Esperamos unos segundos para asegurar que el trigger haya terminado antes de continuar.

                // Polling simple para esperar a que el perfil exista (opcional pero recomendado para UX)
                const checkProfile = async () => {
                    // Intento ciego, si no existe el cliente reintentará al navegar
                };
            }

            return data;
        },
        logout: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        getCurrentUser: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
        me: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data) return null;
            return data.user;
        }
    },
    entities: {
        Driver: {
            list: async (orderBy = 'created_at', ascending = false) => {
                let query = supabase.from('drivers').select('*');

                // Handle complex orderBy strings like '-created_date'
                if (orderBy.startsWith('-')) {
                    const column = orderBy.substring(1) === 'created_date' ? 'created_at' : orderBy.substring(1);
                    query = query.order(column, { ascending: false });
                } else {
                    const column = orderBy === 'created_date' ? 'created_at' : orderBy;
                    query = query.order(column, { ascending: ascending });
                }

                const { data, error } = await query;
                if (error) {
                    console.error("Error fetching drivers:", error);
                    throw error; // Propagate error to be caught by UI
                }

                // Enriquecer datos con simulaciones para UI de Gig Economy
                return data.map(d => ({
                    ...d,
                    // Si no existen en DB, usamos mocks realistas
                    wallet_balance: d.wallet_balance ?? Math.floor(Math.random() * 500000) - 100000,
                    pending_commission: d.pending_commission ?? Math.floor(Math.random() * 50000),
                    acceptance_rate: d.acceptance_rate ?? (80 + Math.floor(Math.random() * 20)),
                    cancellation_rate: d.cancellation_rate ?? Math.floor(Math.random() * 15),
                    last_active_at: d.last_active_at ?? new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)).toISOString(),
                    documents_status: d.documents_status || {
                        license: Math.random() > 0.1 ? 'valid' : 'expired',
                        insurance: Math.random() > 0.1 ? 'valid' : 'pending',
                        background: 'valid'
                    }
                }));
            },
            get: async (id) => {
                const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
                if (error) throw error;
                return data;
            },
            create: async (dataRaw) => {
                // Separamos los datos de auth y perfil
                // NOTA: En un flujo real, el registro de auth se hace primero
                // Aquí solo simulamos la creación del perfil en la tabla drivers
                // Asumimos que el usuario YA está autenticado o manejamos la creación de usuario suelto

                // Opción simple: Insertar en tabla pública (requiere policies permisivas o trigger)
                const { data, error } = await supabase.from('drivers').insert([dataRaw]).select();
                if (error) throw error;
                return data[0];
            },
            update: async (id, updates) => {
                const { data, error } = await supabase.from('drivers').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            },
            filter: async (criteria) => {
                let query = supabase.from('drivers').select('*');
                Object.entries(criteria).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        query = query.in(key, value);
                    } else {
                        query = query.eq(key, value);
                    }
                });
                const { data, error } = await query;
                if (error) {
                    console.error("Error filtering drivers:", error);
                    return [];
                }
                return data;
            },
            updateLocation: async (lat, lng, rotation = 0) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");
                const { error } = await supabase.from('driver_locations').upsert({
                    driver_id: user.id,
                    lat,
                    lng,
                    rotation,
                    updated_at: new Date().toISOString()
                });
                if (error) throw error;
                return { success: true };
            },
            getNearby: async (lat, lng, radiusKm = 5) => {
                const latDiff = radiusKm / 111.32;
                const lngDiff = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

                const { data, error } = await supabase
                    .from('driver_locations')
                    .select('*, driver:drivers(*)')
                    .gt('lat', lat - latDiff)
                    .lt('lat', lat + latDiff)
                    .gt('lng', lng - lngDiff)
                    .lt('lng', lng + lngDiff);

                if (error) {
                    console.error("Error fetching nearby drivers:", error);
                    return [];
                }
                return data;
            }
        },
        Passenger: {
            list: async (orderBy = 'created_at', ascending = false) => {
                // Fetch passengers and their trips (count)
                let query = supabase.from('passengers').select(`
                    *,
                    trips:trips(count)
                `);

                // Handle order
                if (orderBy.startsWith('-')) {
                    const column = orderBy.substring(1);
                    query = query.order(column, { ascending: false });
                } else {
                    query = query.order(orderBy, { ascending: ascending });
                }

                const { data, error } = await query;
                if (error) {
                    console.error("Error fetching passengers:", error);
                    return [];
                }

                // Transform data to flatten count
                return (data || []).map(p => ({
                    ...p,
                    total_trips: p.trips?.[0]?.count || 0
                }));
            },
            get: async (id) => {
                const { data, error } = await supabase.from('passengers').select('*').eq('id', id).single();
                if (error) throw error;
                return data;
            },
            create: async (dataRaw) => {
                const { data, error } = await supabase.from('passengers').insert([dataRaw]).select();
                if (error) throw error;
                return data[0];
            },
            filter: async (criteria) => {
                let query = supabase.from('passengers').select('*, trips(count)');
                Object.entries(criteria).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        query = query.in(key, value);
                    } else {
                        query = query.eq(key, value);
                    }
                });
                const { data, error } = await query;
                if (error) {
                    console.error("Error filtering passengers:", error);
                    return [];
                }
                // Transform data to flatten count
                return (data || []).map(p => ({
                    ...p,
                    total_trips: p.trips?.[0]?.count || 0
                }));
            }
        },
        Trip: {
            list: async () => {
                const { data, error } = await supabase.from('trips').select('*, driver:drivers(*), passenger:passengers(*)');
                if (error) return [];
                return data;
            },
            listByPassenger: async (passengerId) => {
                const { data, error } = await supabase
                    .from('trips')
                    .select('*, driver:drivers(*)')
                    .eq('passenger_id', passengerId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching passenger trips:", error);
                    return [];
                }
                return data;
            },
            create: async (tripData) => {
                const { data, error } = await supabase.from('trips').insert([tripData]).select();
                if (error) throw error;
                return data[0];
            },
            update: async (id, updates) => {
                const { data, error } = await supabase.from('trips').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            },
            filter: async (criteria) => {
                let query = supabase.from('trips').select('*, driver:drivers(*), passenger:passengers(*)');
                Object.entries(criteria).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        query = query.in(key, value);
                    } else {
                        query = query.eq(key, value);
                    }
                });
                // Default ordering
                query = query.order('created_at', { ascending: false });

                const { data, error } = await query;
                if (error) {
                    console.error("Error filtering trips:", error);
                    return [];
                }
                return data;
            }
        },
        // Mocks temporales para entidades que no están en Supabase aun
        PriceConfig: {
            list: async () => {
                const { data, error } = await supabase.from('price_configs').select('*').eq('is_active', true).order('vehicle_type');
                if (error) {
                    console.error("Error fetching price configs:", error);
                    return [];
                }
                return data;
            },
            update: async (id, updates) => {
                const { data, error } = await supabase.from('price_configs').update(updates).eq('id', id).select();
                if (error) throw error;
                return data[0];
            },
            create: async (data) => {
                const { data: newConfig, error } = await supabase.from('price_configs').insert([data]).select();
                if (error) throw error;
                return newConfig[0];
            },
            filter: async (criteria) => {
                let query = supabase.from('price_configs').select('*');
                Object.entries(criteria).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
                const { data, error } = await query;
                if (error) {
                    console.error("Error filtering price configs:", error);
                    return [];
                }
                return data;
            }
        },
        Vehicle: {
            list: async () => {
                // Extract vehicles from drivers for the mock
                const drivers = await goApp.entities.Driver.list();
                return drivers.map(d => ({
                    id: d.id, // Using driver ID as vehicle ID for 1-to-1 mapping in this mock
                    driver_id: d.id,
                    driver_name: `${d.first_name} ${d.last_name}`,
                    make: d.vehicle_make,
                    model: d.vehicle_model,
                    plate: d.vehicle_plate,
                    year: d.vehicle_year || '2020',
                    color: d.vehicle_color,
                    type: d.vehicle_type,
                    status: 'active', // active, maintenance, blocked
                    categories: [d.vehicle_type, ...(d.vehicle_year > 2018 ? ['comfort'] : [])], // Auto-assign mocked categories
                    photos: {
                        front: 'https://placehold.co/600x400/1a1a2e/ffffff?text=Frente',
                        back: 'https://placehold.co/600x400/1a1a2e/ffffff?text=Trasera',
                        side: 'https://placehold.co/600x400/1a1a2e/ffffff?text=Lateral',
                        interior: 'https://placehold.co/600x400/1a1a2e/ffffff?text=Interior',
                    },
                    last_audit: '2024-01-15'
                }));
            },
            update: async (id, data) => {
                console.log(`Mock Vehicle update ${id}:`, data);
                return { success: true };
            }
        },
        Zone: {
            list: async () => {
                // Mock initial zones
                return [
                    {
                        id: 1,
                        name: 'Aeropuerto Internacional',
                        type: 'fixed_fare',
                        value: 80000,
                        color: '#EF4444',
                        is_active: true,
                        points: [
                            [-25.242, -57.515],
                            [-25.242, -57.530],
                            [-25.230, -57.530],
                            [-25.230, -57.515]
                        ] // Approx coord for transparency
                    },
                    {
                        id: 2,
                        name: 'Zona Centro (Alta Demanda)',
                        type: 'surge',
                        value: 1.5,
                        color: '#F59E0B',
                        is_active: true,
                        points: [
                            [-25.280, -57.635],
                            [-25.280, -57.650],
                            [-25.295, -57.650],
                            [-25.295, -57.635]
                        ]
                    }
                ];
            },
            create: async (data) => {
                console.log('Mock Create Zone:', data);
                return { ...data, id: Date.now() };
            },
            update: async (id, data) => {
                console.log(`Mock Update Zone ${id}:`, data);
                return { ...data, id };
            },
            delete: async (id) => {
                console.log(`Mock Delete Zone ${id}`);
                return { success: true };
            }
        },
        Wallet: {
            getStats: async () => {
                return {
                    total_revenue: 154000000, // Gs.
                    pending_collections: 4500000, // Deuda conductores
                    pending_payouts: 12000000, // A pagar a conductores (tarjeta)
                    platform_balance: 85000000 // Disponible
                };
            },
            listDebtors: async () => {
                // Mock drivers with debt
                return [
                    { id: 101, name: 'Juan Pérez', phone: '0981123456', debt: 150000, last_payment: '2024-03-10' },
                    { id: 102, name: 'Maria Gomez', phone: '0971654321', debt: 85000, last_payment: '2024-03-12' },
                    { id: 103, name: 'Carlos Ruiz', phone: '0991234567', debt: 210000, last_payment: '2024-03-01' },
                    { id: 105, name: 'Ana Torres', phone: '0982555666', debt: 45000, last_payment: '2024-03-14' },
                ];
            },
            listPayouts: async () => {
                return [
                    { id: 1, date: '2024-03-15', amount: 15000000, status: 'completed', count: 12 },
                    { id: 2, date: '2024-03-01', amount: 14500000, status: 'completed', count: 10 },
                ];
            },
            markPaid: async (driverId, amount) => {
                console.log(`Mock Wallet: Driver ${driverId} paid ${amount}`);
                return { success: true };
            },
            generatePayout: async () => {
                console.log('Mock Wallet: Generated Payout File');
                return { success: true, url: '#' };
            }
        },
        Marketing: {
            Coupons: {
                list: async () => [
                    { id: 1, code: 'BIENVENIDA', discount: 20, type: 'percent', max_uses: 1000, used_count: 450, expires_at: '2025-12-31', is_active: true },
                    { id: 2, code: 'VERANO2025', discount: 5000, type: 'fixed', max_uses: 500, used_count: 120, expires_at: '2025-03-01', is_active: true },
                    { id: 3, code: 'VIPUSER', discount: 100, type: 'percent', max_uses: 50, used_count: 50, expires_at: '2024-12-01', is_active: false }
                ],
                create: async (data) => {
                    console.log('Mock Create Coupon:', data);
                    return { ...data, id: Date.now(), used_count: 0, is_active: true };
                },
                toggle: async (id) => {
                    console.log(`Mock Toggle Coupon ${id}`);
                    return { success: true };
                }
            },
            Notifications: {
                list: async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return [];
                    const { data, error } = await supabase.from('notifications')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    if (error) return [];
                    return data;
                },
                send: async (data) => {
                    const { data: newNotif, error } = await supabase.from('notifications').insert([data]).select().single();
                    if (error) throw error;
                    return newNotif;
                },
                markAllRead: async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
                }
            },
            Referrals: {
                get: async () => ({
                    passenger_bonus: 10000, // Gs
                    driver_bonus: 50000, // Gs
                    required_trips: 10,
                    is_active: true
                }),
                update: async (data) => {
                    console.log('Mock Update Referral Config:', data);
                    return { success: true };
                }
            },
            Agreements: {
                list: async () => [
                    { id: 1, name: 'Estación Shell', discount: '10% OFF', type: 'fuel', logo: '⛽', expires_at: '2025-12-31', is_active: true },
                    { id: 2, name: 'Lubricentro Box', discount: '20% OFF', type: 'service', logo: '🛠️', expires_at: '2025-06-30', is_active: true },
                    { id: 3, name: 'Burger King', discount: '2x1 Combo', type: 'food', logo: '🍔', expires_at: '2024-12-31', is_active: false }
                ],
                create: async (data) => {
                    console.log('Mock Create Agreement:', data);
                    return { ...data, id: Date.now(), is_active: true };
                },
                toggle: async (id) => {
                    console.log(`Mock Toggle Agreement ${id}`);
                    return { success: true };
                }
            },
            TrustedContact: {
                list: async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return [];
                    const { data, error } = await supabase.from('trusted_contacts')
                        .select('*')
                        .eq('user_id', user.id);
                    if (error) throw error;
                    return data;
                },
                add: async (contact) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("No user logged in");

                    const { data, error } = await supabase.from('trusted_contacts').insert([{
                        user_id: user.id,
                        ...contact
                    }]).select().single();

                    if (error) throw error;
                    return data;
                },
                remove: async (id) => {
                    const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);
                    if (error) throw error;
                    return { success: true };
                }
            },
            Messages: {
                listByTrip: async (tripId) => {
                    const { data, error } = await supabase.from('messages')
                        .select('*')
                        .eq('trip_id', tripId)
                        .order('created_at', { ascending: true });
                    if (error) throw error;
                    return data;
                },
                send: async (tripId, text, senderType) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("Not authenticated");
                    const { data, error } = await supabase.from('messages').insert([{
                        trip_id: tripId,
                        sender_id: user.id,
                        sender_type: senderType,
                        text: text
                    }]).select().single();
                    if (error) throw error;
                    return data;
                }
            },
            SavedPlace: {
                list: async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return [];
                    const { data, error } = await supabase.from('saved_places')
                        .select('*')
                        .eq('user_id', user.id);
                    if (error) throw error;
                    return data;
                },
                add: async (place) => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("No user logged in");
                    const { data, error } = await supabase.from('saved_places').insert([{
                        user_id: user.id,
                        ...place
                    }]).select().single();
                    if (error) throw error;
                    return data;
                }
            }
        },
        Security: {
            Disputes: {
                list: async () => [
                    { id: 101, trip_id: 'TR-8821', user: 'Ana Lopez', role: 'passenger', type: 'Cobro indebido', reason: 'El conductor no terminó el viaje al llegar.', status: 'pending', amount: 15000, date: '2024-03-20 14:30' },
                    { id: 102, trip_id: 'TR-9932', user: 'Carlos Ruiz', role: 'driver', type: 'Pasajero agresivo', reason: 'Intentó dañar el vehículo.', status: 'pending', amount: 0, date: '2024-03-19 22:15' },
                    { id: 103, trip_id: 'TR-7711', user: 'Maria Silva', role: 'passenger', type: 'Objeto perdido', reason: 'Olvidé mi cartera en el asiento trasero.', status: 'resolved', amount: 0, date: '2024-03-18 09:00' }
                ],
                resolve: async (id, resolution) => {
                    console.log(`Mock Resolve Dispute ${id}:`, resolution);
                    return { success: true };
                }
            },
            SOS: {
                listActive: async () => [
                    { id: 1, type: 'panic_button', user: 'Laura M.', role: 'passenger', lat: -25.280, lng: -57.635, time: 'Hace 2 min', status: 'active', battery: 15 },
                    { id: 2, type: 'deviation', user: 'Pedro A.', role: 'driver', lat: -25.295, lng: -57.650, time: 'Hace 5 min', status: 'monitoring', battery: 80 }
                ],
                resolve: async (id) => {
                    console.log(`Mock Resolve SOS ${id}`);
                    return { success: true };
                }
            },
            Users: {
                listRisk: async () => [
                    { id: 88, name: 'Roberto Gomez', role: 'driver', rating: 3.8, trips: 45, reports: 5, status: 'active', last_incident: 'Conducción temeraria' },
                    { id: 92, name: 'Luis Morales', role: 'passenger', rating: 3.5, trips: 12, reports: 3, status: 'suspended', last_incident: 'No pago' },
                    { id: 105, name: 'Mario Benitez', role: 'driver', rating: 4.9, trips: 1200, reports: 0, status: 'blocked', last_incident: 'Documentos vencidos' }
                ],
                toggleBan: async (id, status) => {
                    console.log(`Mock Toggle Ban User ${id} to ${status}`);
                    return { success: true };
                }
            }
        }
    },
    // Real-time Subscriptions
    subscriptions: {
        trip: (tripId, callback) => {
            return supabase
                .channel(`trip:${tripId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'trips',
                    filter: `id=eq.${tripId}`
                }, (payload) => callback(payload.new))
                .subscribe();
        },
        nearbyDrivers: (lat, lng, radiusKm, callback) => {
            // Note: Supabase Postgres Changes doesn't support radius filters in real-time.
            // We listen to all location changes and filter in the client, or use an Edge Function.
            // For now, simplicity: listen to ALL changes in driver_locations
            return supabase
                .channel('nearby-drivers')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'driver_locations'
                }, (payload) => {
                    // Client-side filtering
                    const driver = payload.new || payload.old;
                    if (!driver) return;
                    const dist = Math.sqrt(Math.pow(driver.lat - lat, 2) + Math.pow(driver.lng - lng, 2)) * 111;
                    if (dist <= radiusKm) {
                        callback(payload);
                    }
                })
                .subscribe();
        },
        chat: (tripId, callback) => {
            return supabase
                .channel(`chat:${tripId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `trip_id=eq.${tripId}`
                }, (payload) => callback(payload.new))
                .subscribe();
        }
    }
};
