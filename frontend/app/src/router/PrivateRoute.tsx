import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PrivateRoutes are only accessible to authenticated users.

import { ReactNode } from "react";

interface PrivateRouteProps {
    children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { user } = useAuth();

    console.log("Private route:");

    if (user === null) {
        console.log("Access denied");
        return <Navigate to="/login" />;
    }

    console.log("Access granted");
    return <>{children}</>;
}