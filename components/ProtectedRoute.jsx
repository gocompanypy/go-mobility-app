import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const location = useLocation();

    // Check if user is logged in
    const user = localStorage.getItem('go_user');

    if (!user) {
        // Redirect to login page with return url
        // Determine login path based on required role (simple logic for now)
        const loginPath = allowedRoles.includes('admin') ? '/admin' : '/passenger/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // In a real app, we would parse the user object and check roles.
    // For now, we assume if "go_user" exists, they are authorized.

    return children;
}
