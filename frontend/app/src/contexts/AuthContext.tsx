import { createContext, useContext, useState } from "react";
import User from "../types/User";

interface AuthContextType {
    user: User;
    getToken: () => string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    changeUserLanguage: (language: 'en' | 'fr') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User>(getUser());

    function getUser() {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return defaultUser();
    }

    function defaultUser(): User {
        return {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            is_logged_in: false,
            language: "en"
        };
    }

    function getToken() {
        return localStorage.getItem("token");
    }

    const login = (user: User, token: string) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        setUser(defaultUser());
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const changeUserLanguage = (language: 'en' | 'fr') => {
        const updatedUser = { ...user, language };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, getToken, login, logout, changeUserLanguage }}>
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