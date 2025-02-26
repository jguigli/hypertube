import { createContext, useContext, useState, useEffect } from "react";
import User from "../types/User";
import AuthService from "../services/AuthService";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    function getStoredUser() {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return null;
    }

    const [user, setUser] = useState<User | null>(getStoredUser());

    const login = async (username: string, password: string) => {
        // const authService = new AuthService();
        // const response = await authService.login(username, password);
        // if (response.success && response.token && response.user) {
        //     setUser(response.user);
        //     localStorage.setItem("user", JSON.stringify(response.user));
        //     localStorage.setItem("token", response.token);
        // } else {

            // TODO: Remove this block after testing
            // For testing purposes
            const fakeUser: User = {
                id: "1",
                username: "admin",
                email: "admin@example.com",
                firstName: "Admin",
                lastName: "Admin",
                avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            };
            setUser(fakeUser);
            localStorage.setItem("user", JSON.stringify(fakeUser));
            localStorage.setItem("token", "fake-token");
            // throw new Error("Login failed");
        // }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}