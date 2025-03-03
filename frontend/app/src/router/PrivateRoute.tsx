import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PrivateRoutes are only accessible to authenticated users.

import { ReactNode } from "react";

interface PrivateRouteProps {
    children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { user } = useAuth();

    if (!user.is_logged_in) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

export function LogoutRoute({ children }: PrivateRouteProps) {
    const { user } = useAuth();

    if (!user.is_logged_in) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}
