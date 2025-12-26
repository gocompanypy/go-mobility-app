import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function createPageUrl(pageName) {
    const routes = {
        'Home': '/',
        'PassengerWelcome': '/passenger/welcome',
        'PassengerLogin': '/passenger/login',
        'PassengerSignup': '/passenger/signup',
        'PassengerVerification': '/passenger/verification',
        'PassengerHome': '/passenger/home',
        'PassengerHistory': '/passenger/history',
        'PassengerPromotions': '/passenger/promotions',
        'PassengerRewards': '/passenger/rewards',
        'PassengerTrustedContacts': '/passenger/trusted-contacts',
        'DriverWelcome': '/driver/welcome',
        'DriverLogin': '/driver/login',
        'DriverSignup': '/driver/signup',
        'DriverRegister': '/driver/register',
        'DriverDocuments': '/driver/documents',
        'DriverSuccess': '/driver/success',
        'DriverHome': '/driver/home',
        'DriverEarnings': '/driver/earnings',
        'DriverHistory': '/driver/history',
        'DriverDigitalId': '/driver/digital-id',
        'AdminDashboard': '/admin/dashboard',
        'AdminDrivers': '/admin/drivers',
        'AdminPassengers': '/admin/passengers',
        'AdminTrips': '/admin/trips',
        'AdminPricing': '/admin/pricing',
        'AdminGeofencing': '/admin/geofencing',
        'AdminFleet': '/admin/fleet'
    };
    return routes[pageName] || '/';
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace(/\s/g, ' ');
}
