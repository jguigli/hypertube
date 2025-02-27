import { createContext, useContext, useState } from "react";

interface UsersID {
    id: string;
    username: string;
}

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
    usersID: UsersID[];
    setUsersID: (usersID: UsersID[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {

    const [searchQuery, setSearchQuery] = useState("");

    // Use GET /api/users to fetch all users ID/username
    const [usersID, setUsersID] = useState<UsersID[]>([
        { id: "1", username: "a" },
        { id: "2", username: "b" },
        { id: "3", username: "c" },
        { id: "4", username: "d" },
        { id: "5", username: "e" },
    ]);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, usersID, setUsersID }}>
            {children}
        </SearchContext.Provider>
    );

}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
