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
        'DriverWelcome': '/driver/welcome',
        'DriverLogin': '/driver/login',
        'DriverSignup': '/driver/signup',
        'DriverRegister': '/driver/register',
        'DriverDocuments': '/driver/documents',
        'DriverSuccess': '/driver/success',
        'DriverHome': '/driver/home',
        'DriverEarnings': '/driver/earnings',
        'AdminDashboard': '/admin/dashboard',
        'AdminDrivers': '/admin/drivers',
        'AdminTrips': '/admin/trips',
        'AdminPricing': '/admin/pricing'
    };
    return routes[pageName] || '/';
}
