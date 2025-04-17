import { createContext, useContext, useState, useEffect } from "react";
import User from "../types/User";
import { useTranslation } from "react-i18next";

interface AuthContextType {
    user: User;
    getToken: () => string;
    login: (user: User, token: string) => void;
    logout: () => void;
    changeUserLanguage: (language: 'en' | 'fr') => void;
    changeUserAvatar: (avatar: string) => void;
    changeUserInfo: (user: User) => void;
    logoutAndRedirect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const { i18n } = useTranslation();

    const [user, setUser] = useState<User>(getUser());

    useEffect(() => {
        i18n.changeLanguage(user.language);
    }, [user.language]);

    function getUser() {
        const storedUser = localStorage.getItem("user");
        const language = getUserLanguage();
        if (storedUser) {
            return { ...JSON.parse(storedUser), language };
        }
        return defaultUser(language);
    }

    function defaultUser(language: 'en' | 'fr' = 'en'): User {
        return {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            avatar: "",
            language: language,
            is_logged_in: false,
        };
    }

    function getToken() {
        const token = localStorage.getItem("token");
        return token ? token : '';
    }

    function getUserLanguage(): 'en' | 'fr' {
        return (localStorage.getItem("language") as 'en' | 'fr') || 'en';
    }

    const login = (user: User, token: string) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        const language = getUserLanguage();
        setUser(defaultUser(language));
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const logoutAndRedirect = () => {
        logout();
        window.location.href = '/';
    };

    const changeUserLanguage = (language: 'en' | 'fr') => {
        localStorage.setItem("language", language);
        const newUser = { ...user, language };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const changeUserAvatar = (avatar: string) => {
        const newUser = { ...user, avatar };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const changeUserInfo = (user: User) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
    };

    return (
        <AuthContext.Provider value={{ user, getToken, login, logout, changeUserLanguage, changeUserAvatar, changeUserInfo, logoutAndRedirect }}>
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