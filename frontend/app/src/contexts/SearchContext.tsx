import { createContext, useContext, useState } from "react";

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
    resetSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {

    const [searchQuery, setSearchQuery] = useState("");

    function resetSearch() {
        setSearchQuery("");
    }

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, resetSearch }}>
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
