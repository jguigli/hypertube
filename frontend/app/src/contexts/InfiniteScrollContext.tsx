import { createContext, useContext, useState } from "react";

interface InfiniteScrollContextType {
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    setPage: (page: number) => void;
    setHasMore: (hasMore: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
}

const InfiniteScrollContext = createContext<InfiniteScrollContextType | undefined>(undefined);

export function InfiniteScrollProvider({ children }: { children: React.ReactNode }) {

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <InfiniteScrollContext.Provider value={{ page, hasMore, isLoading, setPage, setHasMore, setIsLoading }}>
            {children}
        </InfiniteScrollContext.Provider>
    );

}

export function useInfiniteScroll() {
    const context = useContext(InfiniteScrollContext);
    if (!context) {
        throw new Error("useInfiniteScroll must be used within a InfiniteScrollProvider");
    }
    return context;
}
