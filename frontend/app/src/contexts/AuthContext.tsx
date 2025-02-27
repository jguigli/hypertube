import { createContext, useContext, useState } from "react";
import User from "../types/User";

interface AuthContextType {
    user: User;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    changeUserLanguage: (language: 'en' | 'fr') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    function defaultUser(): User {
        return {
            id: "0",
            username: "default_user",
            email: "",
            firstName: "Default",
            lastName: "User",
            avatar: "https://randomuser.me/api/portraits/men/0.jpg",
            is_logged_in: false,
            language: "en"
        };
    }

    function getStoredUser() {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return defaultUser();
    }

    const [user, setUser] = useState<User>(getStoredUser());

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
            language: "en",
            is_logged_in: true
        };
        setUser(fakeUser);
        localStorage.setItem("user", JSON.stringify(fakeUser));
        localStorage.setItem("token", "fake-token");
        // throw new Error("Login failed");
        // }
    };

    const logout = () => {
        setUser({ is_logged_in: false, language: "en" });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const changeUserLanguage = (language: 'en' | 'fr') => {
        const updatedUser = { ...user, language };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, changeUserLanguage }}>
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