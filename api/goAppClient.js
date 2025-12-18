import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const goApp = {
    auth: {
        login: async (phone) => {
            // Simulación de Login con Teléfono
            // En Supabase real, esto requeriría una Function o Auth OTP (SMS)
            // Para la demo, usamos el email generado: [telefono]@goapp.com + Pass: 123456
            const email = `${phone.replace(/\D/g, '')}@goapp.com`;
            const password = '123456';

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                console.error("Login failed:", error);
                // Personalizar mensaje para el usuario
                throw new Error("No pudimos encontrar una cuenta con ese número.");
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

            return { user: data.user, profile, role };
        },
        register: async (phone, password, metadata = {}) => {
            // Registro con Teléfono (Simulado)
            // 1. Crear usuario en Auth (email = phone@goapp.com)
            const email = `${phone.replace(/\D/g, '')}@goapp.com`;
            const finalPassword = password || '123456'; // Default pass if not provided

            const { data, error } = await supabase.auth.signUp({
                email,
                password: finalPassword,
                options: {
                    data: metadata, // full_name, role, etc.
                }
            });

            if (error) throw error;

            // 2. Crear perfil público (según role)
            // Esto es crucial porque Supabase no lo hace automático sin Triggers (en este setup simple)
            if (metadata.role === 'driver') {
                const { error: profileError } = await supabase.from('drivers').insert([{
                    id: data.user.id,
                    email: email,
                    phone: phone,
                    first_name: metadata.first_name || '',
                    last_name: metadata.last_name || '',
                    vehicle_type: metadata.vehicle_type || 'economy',
                    // Defaults para nuevos drivers
                    is_online: false,
                    is_available: true,
                    rating: 5.0,
                    total_trips: 0
                }]);
                if (profileError) console.error("Error creating driver profile:", profileError);
            } else if (metadata.role === 'passenger') {
                const { error: profileError } = await supabase.from('passengers').insert([{
                    id: data.user.id,
                    email: email,
                    phone: phone,
                    full_name: metadata.full_name || '',
                    rating: 5.0
                }]);
                if (profileError) console.error("Error creating passenger profile:", profileError);
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
        }
    },
    entities: {
        Driver: {
            list: async () => {
                const { data, error } = await supabase.from('drivers').select('*');
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
            }
        },
        Passenger: {
            list: async () => {
                // Fetch passengers and their trips (count)
                // Note: select('*, trips(count)') requires foreign key setup properly in Supabase
                // For now, we fetch stats separately or rely on simple join if supported
                const { data, error } = await supabase.from('passengers').select(`
                    *,
                    trips:trips(count)
                `);

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
            }
        },
        // Mocks temporales para entidades que no están en Supabase aun
        PriceConfig: {
            list: async () => [
                { id: 1, name: 'Tarifa Base', amount: 5000, is_active: true },
                { id: 2, name: 'Por Km', amount: 3500, is_active: true },
                { id: 3, name: 'Por Minuto', amount: 500, is_active: true }
            ],
            update: async () => { }
        }
    }
};
