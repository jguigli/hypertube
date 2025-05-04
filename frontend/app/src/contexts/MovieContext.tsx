import { createContext, useState, useEffect, useContext, useCallback } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";
import { useAuth } from "./AuthContext";
import { useSearch } from "./SearchContext";
import { useFilterSort } from "./FilterSortContext";
import { useLoading } from "./LoadingContext";

interface MoviesContextType {
    movies: Movie[];
    fetchNextPage: () => void;
    resetMovies: () => void;
    hasMore: boolean;
    isLoading: boolean;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {
    const movieService = new MovieService();
    const { user, getToken } = useAuth();
    const { searchQuery } = useSearch();
    const { filterOptions, sortOptions } = useFilterSort();
    const { setIsLoading } = useLoading();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [localIsLoading, setLocalIsLoading] = useState(false);
    const [fetchLock, setFetchLock] = useState(false); // Verrou pour empêcher les appels concurrents

    // Synchroniser localIsLoading avec le contexte global
    useEffect(() => {
        setIsLoading(localIsLoading);
    }, [localIsLoading, setIsLoading]);

    const resetMovies = useCallback(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
    }, []);

    const fetchMovies = useCallback(
        async (newPage: number) => {
            if (localIsLoading || fetchLock) return; // Vérification locale

            setFetchLock(true);
            setLocalIsLoading(true);
            try {
                const token = getToken();
                const response = searchQuery
                    ? await movieService.searchMovies(searchQuery, user.language, newPage, filterOptions, sortOptions, token)
                    : await movieService.getPopularMovies(newPage, user.language, filterOptions, sortOptions, token);

                if (response.success) {
                    setMovies((prevMovies) => {
                        const newMovies = response.data.filter(
                            (movie: Movie) => !prevMovies.some((prevMovie) => prevMovie.id === movie.id)
                        );
                        return newPage === 1 ? newMovies : [...prevMovies, ...newMovies];
                    });
                    setHasMore(response.data.length > 0);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Failed to fetch movies:", error);
                setHasMore(false);
            } finally {
                setLocalIsLoading(false);
                setFetchLock(false);
            }
        },
        [searchQuery, filterOptions, sortOptions, user.language, getToken, movieService] // Retiré localIsLoading et fetchLock
    );

    const fetchNextPage = useCallback(() => {
        if (localIsLoading || !hasMore || fetchLock) return; // Vérification locale
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchMovies(nextPage);
            return nextPage;
        });
    }, [hasMore, fetchMovies]); // Retiré localIsLoading et fetchLock

    useEffect(() => {
        resetMovies();
        fetchMovies(1);
    }, [searchQuery, filterOptions, sortOptions, user.language]); // Dépendances minimales

    return (
        <MoviesContext.Provider value={{ movies, fetchNextPage, resetMovies, hasMore, isLoading: localIsLoading }}>
            {children}
        </MoviesContext.Provider>
    );
}

export function useMovies() {
    const context = useContext(MoviesContext);
    if (!context) {
        throw new Error("useMovies must be used within a MoviesProvider");
    }
    return context;
}