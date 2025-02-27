import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PublicRoutes are only accessible to non authenticated users.
// Example: Login, Register, Forgot Password, etc.

import { ReactNode } from "react";

interface PublicRouteProps {
    children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { user } = useAuth();

    if (user.is_logged_in === true) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}