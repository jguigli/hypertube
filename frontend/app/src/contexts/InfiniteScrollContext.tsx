import { createContext, useContext, useState } from "react";

interface InfiniteScrollContextType {
    page: number;
    hasMore: boolean;
    setPage: (page: number) => void;
    setHasMore: (hasMore: boolean) => void;
}

const InfiniteScrollContext = createContext<InfiniteScrollContextType | undefined>(undefined);

export function InfiniteScrollProvider({ children }: { children: React.ReactNode }) {

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    return (
        <InfiniteScrollContext.Provider value={{ page, hasMore, setPage, setHasMore }}>
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
