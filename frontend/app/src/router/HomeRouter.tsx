import { useAuth } from "../contexts/AuthContext";

import { ReactNode } from "react";
import LandingPage from "../components/LandingPage";

interface HomeRouterProps {
    children: ReactNode;
}

export default function HomeRouter({ children }: HomeRouterProps) {

    const { user } = useAuth();

    if (!user.is_logged_in) {
        return <LandingPage />;
    }

    return <>{children}</>;
}