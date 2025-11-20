import React from 'react';

import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
    userRole?: string ;
    isAuthenticated?: boolean;
}
// isautheticate hook
const ProtectedRoute = ({ children , allowedRoles = [],
    userRole,
    isAuthenticated }:Props) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }
   
    return children;
};

export default ProtectedRoute;