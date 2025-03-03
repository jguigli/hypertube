import { createContext, useContext, useState } from "react";

interface ActiveLinkContextType {
    activeLink: string;
    setActiveLink: (searchQuery: string) => void;
}

const ActiveLinkContext = createContext<ActiveLinkContextType | undefined>(undefined);

export function ActiveLinkProvider({ children }: { children: React.ReactNode }) {

    const [activeLink, setActiveLink] = useState("");

    return (
        <ActiveLinkContext.Provider value={{ activeLink, setActiveLink }}>
            {children}
        </ActiveLinkContext.Provider>
    );

}

export function useActiveLink() {
    const context = useContext(ActiveLinkContext);
    if (!context) {
        throw new Error("useActiveLink must be used within a ActiveLinkProvider");
    }
    return context;
}
