import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './Layout';

// Public Pages
import Home from './Pages/Home';
import DemoImages from './Pages/DemoImages';

// Passenger Pages
import PassengerHome from './Pages/PassengerHome';
import PassengerLogin from './Pages/PassengerLogin';
import PassengerSignup from './Pages/PassengerSignup';
import PassengerVerification from './Pages/PassengerVerification';
import PassengerWelcome from './Pages/PassengerWelcome';
import PassengerHistory from './Pages/PassengerHistory';
import PassengerPromotions from './Pages/PassengerPromotions';
import PassengerRewards from './Pages/PassengerRewards';
import PassengerTrustedContacts from './Pages/PassengerTrustedContacts';
import PassengerProfile from './Pages/PassengerProfile';

// Driver Pages
import DriverWelcome from './Pages/DriverWelcome';
import DriverLogin from './Pages/DriverLogin';
import DriverSignup from './Pages/DriverSignup';
import DriverRegister from './Pages/DriverRegister';
import DriverPreSignup from './Pages/DriverPreSignup';
import DriverBenefits from './Pages/DriverBenefits';
import DriverDocuments from './Pages/DriverDocuments';
import DriverSuccess from './Pages/DriverSuccess';
import DriverHome from './Pages/DriverHome';
import DriverEarnings from './Pages/DriverEarnings';
import DriverHistory from './Pages/DriverHistory';
import DriverVerification from './Pages/DriverVerification';
import DriverDigitalId from './Pages/DriverDigitalId';

// Admin Pages
import AdminDashboard from './Pages/AdminDashboard';
import AdminDrivers from './Pages/AdminDrivers';
import AdminPassengers from './Pages/AdminPassengers';
import AdminTrips from './Pages/AdminTrips';
import AdminPricing from './Pages/AdminPricing';
import AdminGeofencing from './Pages/AdminGeofencing';
import AdminFleet from './Pages/AdminFleet';
import AdminFinance from './Pages/AdminFinance';
import AdminLogin from './Pages/AdminLogin';
import AdminMarketing from './Pages/AdminMarketing';
import AdminLeads from './Pages/AdminLeads';
import AdminSecurity from './Pages/AdminSecurity';
import AdminLayout from './components/layouts/AdminLayout';

// Components
import UserNotRegisteredError from './components/UserNotRegisteredError';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from 'sonner';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes without Layout */}
                <Route path="/" element={<Home />} />
                <Route path="/demo-images" element={<DemoImages />} />

                {/* Passenger Auth Flow */}
                <Route path="/passenger/welcome" element={<PassengerWelcome />} />
                <Route path="/passenger/login" element={<PassengerLogin />} />
                <Route path="/passenger/signup" element={<PassengerSignup />} />
                <Route path="/passenger/verification" element={<PassengerVerification />} />

                {/* Driver Auth Flow */}
                <Route path="/driver/welcome" element={<DriverWelcome />} />
                <Route path="/driver/benefits" element={<DriverBenefits />} />
                <Route path="/driver/pre-signup" element={<DriverPreSignup />} />
                <Route path="/driver/login" element={<DriverLogin />} />
                <Route path="/driver/signup" element={<Navigate to="/driver/register" replace />} />
                <Route path="/driver/register" element={<DriverRegister />} />
                <Route path="/driver/documents" element={<Navigate to="/driver/register" replace />} />
                <Route path="/driver/success" element={<DriverSuccess />} />
                <Route path="/driver" element={<Navigate to="/driver/welcome" replace />} />

                {/* Passenger Routes (Standalone Layout) */}
                <Route path="/passenger/home" element={<PassengerHome />} />
                <Route path="/passenger/history" element={<PassengerHistory />} />
                <Route path="/passenger/promotions" element={<PassengerPromotions />} />
                <Route path="/passenger/rewards" element={<PassengerRewards />} />
                <Route path="/passenger/trusted-contacts" element={<PassengerTrustedContacts />} />
                <Route path="/passenger/profile" element={<PassengerProfile />} />

                {/* Error Pages */}
                <Route path="/error/access-restricted" element={<UserNotRegisteredError />} />

                {/* Driver Routes (Standalone Layout) */}
                <Route path="/driver/home" element={<DriverHome />} />
                <Route path="/driver/earnings" element={<DriverEarnings />} />
                <Route path="/driver/digital-id" element={<DriverDigitalId />} />
                <Route path="/driver/history" element={<DriverHistory />} />


                {/* Public Verification Route */}
                <Route path="/verify/driver/:id" element={<DriverVerification />} />

                {/* Admin Routes (Standalone Layout) */}
                {/* Admin Routes with Layout */}
                <Route element={
                    <ProtectedRoute allowedRoles={['admin', 'passenger']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/drivers" element={<AdminDrivers />} />
                    <Route path="/admin/passengers" element={<AdminPassengers />} />
                    <Route path="/admin/trips" element={<AdminTrips />} />
                    <Route path="/admin/pricing" element={<AdminPricing />} />
                    <Route path="/admin/geofencing" element={<AdminGeofencing />} />
                    <Route path="/admin/fleet" element={<AdminFleet />} />
                    <Route path="/admin/finance" element={<AdminFinance />} />
                    <Route path="/admin/marketing" element={<AdminMarketing />} />
                    <Route path="/admin/leads" element={<AdminLeads />} />
                    <Route path="/admin/security" element={<AdminSecurity />} />
                </Route>

                {/* Admin Login (No Layout) */}
                <Route path="/admin" element={<AdminLogin />} />

                {/* Protected Routes with Layout (Empty for now, but kept for future use) */}
                <Route element={<Layout />}>
                    {/* Common protected routes can go here */}
                </Route>

                {/* Catch all - Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
                position="top-center"
                duration={4000}
                theme="dark"
                toastOptions={{
                    style: {
                        background: 'rgba(10, 10, 10, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        color: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 15px rgba(255, 215, 0, 0.1)'
                    },
                    classNames: {
                        toast: 'group toast group-[.toaster]:bg-black/90 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg',
                        description: 'group-[.toast]:text-gray-400',
                        actionButton: 'group-[.toast]:bg-[#FFD700] group-[.toast]:text-black group-[.toast]:font-bold',
                        cancelButton: 'group-[.toast]:bg-zinc-800 group-[.toast]:text-white',
                    }
                }}
            />
        </BrowserRouter>
    );
}
