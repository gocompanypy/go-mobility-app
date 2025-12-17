import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './Layout';

// Public Pages
import Home from './Pages/Home';

// Passenger Pages
import PassengerHome from './Pages/PassengerHome';
import PassengerLogin from './Pages/PassengerLogin';
import PassengerSignup from './Pages/PassengerSignup';
import PassengerVerification from './Pages/PassengerVerification';
import PassengerWelcome from './Pages/PassengerWelcome';
import PassengerHistory from './Pages/PassengerHistory';
import PassengerPromotions from './Pages/PassengerPromotions';
import PassengerRewards from './Pages/PassengerRewards';

// Driver Pages
import DriverWelcome from './Pages/DriverWelcome';
import DriverLogin from './Pages/DriverLogin';
import DriverSignup from './Pages/DriverSignup';
import DriverRegister from './Pages/DriverRegister';
import DriverDocuments from './Pages/DriverDocuments';
import DriverSuccess from './Pages/DriverSuccess';
import DriverHome from './Pages/DriverHome';
import DriverEarnings from './Pages/DriverEarnings';

// Admin Pages
import AdminDashboard from './Pages/AdminDashboard';
import AdminDrivers from './Pages/AdminDrivers';
import AdminTrips from './Pages/AdminTrips';
import AdminPricing from './Pages/AdminPricing';

// Components
import UserNotRegisteredError from './Components/UserNotRegisteredError';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes without Layout */}
                <Route path="/" element={<Home />} />

                {/* Passenger Auth Flow */}
                <Route path="/passenger/welcome" element={<PassengerWelcome />} />
                <Route path="/passenger/login" element={<PassengerLogin />} />
                <Route path="/passenger/signup" element={<PassengerSignup />} />
                <Route path="/passenger/verification" element={<PassengerVerification />} />

                {/* Driver Auth Flow */}
                <Route path="/driver/welcome" element={<DriverWelcome />} />
                <Route path="/driver/login" element={<DriverLogin />} />
                <Route path="/driver/signup" element={<DriverSignup />} />
                <Route path="/driver/register" element={<DriverRegister />} />
                <Route path="/driver/documents" element={<DriverDocuments />} />
                <Route path="/driver/success" element={<DriverSuccess />} />

                {/* Error Pages */}
                <Route path="/error/access-restricted" element={<UserNotRegisteredError />} />

                {/* Protected Routes with Layout */}
                <Route element={<Layout />}>
                    {/* Passenger Routes */}
                    <Route path="/passenger/home" element={<PassengerHome />} />
                    <Route path="/passenger/history" element={<PassengerHistory />} />
                    <Route path="/passenger/promotions" element={<PassengerPromotions />} />
                    <Route path="/passenger/rewards" element={<PassengerRewards />} />

                    {/* Driver Routes */}
                    <Route path="/driver/home" element={<DriverHome />} />
                    <Route path="/driver/earnings" element={<DriverEarnings />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/drivers" element={<AdminDrivers />} />
                    <Route path="/admin/trips" element={<AdminTrips />} />
                    <Route path="/admin/pricing" element={<AdminPricing />} />
                </Route>

                {/* Catch all - Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
