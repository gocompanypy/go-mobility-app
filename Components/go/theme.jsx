// GO Mobility Theme Configuration
export const theme = {
    colors: {
        primary: '#FFD700',      // Dorado elegante
        primaryDark: '#FFA500',
        primaryLight: '#FFED4E',
        secondary: '#000000',    // Negro profundo
        secondaryLight: '#1A1A1A',
        accent: '#FF6B6B',       // Rojo para alertas/cancelaciones
        success: '#FFD700',
        warning: '#FFB800',
        error: '#FF4757',
        background: '#000000',
        surface: '#0A0A0A',
        surfaceLight: '#151515',
        text: '#FFFFFF',
        textSecondary: '#B8B8B8',
        textMuted: '#808080',
        border: '#1A1A1A',
        gold: '#FFD700',
        goldLight: '#FFED4E',
        goldDark: '#FFA500',
    },

    vehicleTypes: {
        economy: {
            name: 'GO Economy',
            description: 'Viajes económicos',
            icon: '🚗',
            color: '#00D4B1',
            passengers: 4,
        },
        comfort: {
            name: 'GO Comfort',
            description: 'Más espacio y comodidad',
            icon: '🚙',
            color: '#3B82F6',
            passengers: 4,
        },
        premium: {
            name: 'GO Premium',
            description: 'Vehículos de lujo',
            icon: '🚘',
            color: '#8B5CF6',
            passengers: 4,
        },
        xl: {
            name: 'GO XL',
            description: 'Para grupos grandes',
            icon: '🚐',
            color: '#F59E0B',
            passengers: 6,
        },
        moto: {
            name: 'GO Moto',
            description: 'Rápido y ágil',
            icon: '🏍️',
            color: '#EF4444',
            passengers: 1,
        },
        delivery: {
            name: 'GO Delivery',
            description: 'Envío de paquetes',
            icon: '📦',
            color: '#10B981',
            passengers: 0,
        },
        van: {
            name: 'GO Van',
            description: 'Mudanzas y cargas',
            icon: '🚚',
            color: '#6366F1',
            passengers: 2,
        },
    },

    tripStatuses: {
        searching: { label: 'Buscando conductor', color: '#FFB800', icon: '🔍' },
        accepted: { label: 'Conductor en camino', color: '#3B82F6', icon: '🚗' },
        arrived: { label: 'Conductor llegó', color: '#00D4B1', icon: '📍' },
        in_progress: { label: 'En viaje', color: '#8B5CF6', icon: '🛣️' },
        completed: { label: 'Completado', color: '#10B981', icon: '✅' },
        cancelled_passenger: { label: 'Cancelado', color: '#EF4444', icon: '❌' },
        cancelled_driver: { label: 'Cancelado por conductor', color: '#EF4444', icon: '❌' },
        no_drivers: { label: 'Sin conductores', color: '#6B7280', icon: '😔' },
    },

    paymentMethods: {
        card: { label: 'Tarjeta', icon: '💳' },
        cash: { label: 'Efectivo', icon: '💵' },
        wallet: { label: 'GO Wallet', icon: '👛' },
    },
};

export default theme;
