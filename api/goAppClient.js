import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
                // 2. Crear perfil público (según role)
                if (metadata.role === 'driver') {
                    const { error: profileError } = await supabase.from('drivers').insert([{
                        id: data.user.id,
                        email: email,
                        phone: phone,
                        first_name: metadata.first_name || '',
                        last_name: metadata.last_name || '',
                        vehicle_type: metadata.vehicle_type || 'economy',
                        vehicle_color: metadata.vehicle_color || '',
                        status: 'pending',
                        is_online: false,
                        is_available: true,
                        rating: 5.0,
                        total_trips: 0
                    }]);
                    if (profileError) console.error("Error creating driver profile:", profileError);
                } else if (metadata.role === 'passenger') {
                    const { error: profileError } = await supabase.from('passengers').insert([{
                        id: data.user.id,
                        email: metadata.email || email,
                        phone: phone,
                        full_name: metadata.full_name || '',
                        rating: 5.0
                    }]);
                    if (profileError) console.error("Error creating passenger profile:", profileError);
                }
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
            const { data: { user } } = await supabase.auth.getUser();
            return user;
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
                    return [];
                }
                return data;
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
            list: async () => [
                { id: 1, name: 'Standard', vehicle_type: 'standard', base_fare: 5500, price_per_km: 3800, price_per_min: 550, minimum_fare: 11000, is_active: true }, // Bolt/Red
                { id: 2, name: 'Economy', vehicle_type: 'economy', base_fare: 5000, price_per_km: 3500, price_per_min: 500, minimum_fare: 10000, is_active: true },
                { id: 3, name: 'Large', vehicle_type: 'large', base_fare: 8000, price_per_km: 5000, price_per_min: 800, minimum_fare: 18000, is_active: true }, // L
                { id: 4, name: 'Comfort', vehicle_type: 'comfort', base_fare: 7000, price_per_km: 4500, price_per_min: 700, minimum_fare: 15000, is_active: true },
                { id: 5, name: 'Ploteado', vehicle_type: 'branded', base_fare: 4500, price_per_km: 3200, price_per_min: 450, minimum_fare: 9000, is_active: true }, // Branded/Green
                { id: 6, name: 'Moto', vehicle_type: 'moto', base_fare: 3000, price_per_km: 2000, price_per_min: 300, minimum_fare: 6000, is_active: true }
            ],
            update: async () => { },
            filter: async (criteria) => {
                // Mock filter for PriceConfig
                const allConfigs = [
                    { id: 1, name: 'Standard', vehicle_type: 'standard', base_fare: 5500, price_per_km: 3800, price_per_min: 550, minimum_fare: 11000, is_active: true },
                    { id: 2, name: 'Economy', vehicle_type: 'economy', base_fare: 5000, price_per_km: 3500, price_per_min: 500, minimum_fare: 10000, is_active: true },
                    { id: 3, name: 'Large', vehicle_type: 'large', base_fare: 8000, price_per_km: 5000, price_per_min: 800, minimum_fare: 18000, is_active: true },
                    { id: 4, name: 'Comfort', vehicle_type: 'comfort', base_fare: 7000, price_per_km: 4500, price_per_min: 700, minimum_fare: 15000, is_active: true },
                    { id: 5, name: 'Ploteado', vehicle_type: 'branded', base_fare: 4500, price_per_km: 3200, price_per_min: 450, minimum_fare: 9000, is_active: true },
                    { id: 6, name: 'Moto', vehicle_type: 'moto', base_fare: 3000, price_per_km: 2000, price_per_min: 300, minimum_fare: 6000, is_active: true }
                ];
                return allConfigs.filter(c => {
                    return Object.entries(criteria).every(([key, value]) => c[key] === value);
                });
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
                list: async () => [
                    { id: 1, title: '¡Gana más este fin de semana!', body: 'Bonos activos en zona centro.', segment: 'drivers', date: '2024-03-15 10:00', sent: 1500 },
                    { id: 2, title: 'Tu seguridad es primero', body: 'Recuerda verificar tu viaje.', segment: 'passengers', date: '2024-03-14 15:30', sent: 5000 }
                ],
                send: async (data) => {
                    console.log('Mock Send Notification:', data);
                    return { ...data, id: Date.now(), date: new Date().toLocaleString(), sent: Math.floor(Math.random() * 1000) };
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
    }
};
