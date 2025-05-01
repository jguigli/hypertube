import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";
import { useAuth } from "./AuthContext";
import { useSearch } from "./SearchContext";
import { useFilterSort } from "./FilterSortContext";
import { useLoading } from "./LoadingContext";

interface MoviesContextType {
    movies: Movie[];
    fetchMovies: (newPage?: number) => void;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hasMore: boolean;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const movieService = new MovieService();

    const { user, getToken } = useAuth();
    const { isLoading, setIsLoading } = useLoading();
    const { searchQuery } = useSearch();
    const { filterOptions, sortOptions } = useFilterSort();

    // Infinite scroll state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Movies state
    const [movies, setMovies] = useState<Movie[]>([]);

    // Ref to track if the component is mounted
    const isMounted = useRef(false);

    // Fetch movies function
    const fetchMovies = useCallback(async (newPage: number = 1) => {

        console.log("Fetching movies...");

        if (isLoading) return; // Prevent multiple simultaneous requests
        setIsLoading(true);

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
                    return newPage === 1 ? newMovies : [...prevMovies, ...newMovies]; // Réinitialiser les films si c'est la première page
                });
                setHasMore(response.data.length > 0);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch movies:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, filterOptions, sortOptions, user.language]);

    useEffect(() => {
        async function fetchMoviesOnMount() {
            if (isMounted.current) {
                setPage(1); // Reset page
                setMovies([]); // Reset movie list
                setHasMore(true); // Reset infinite scroll state
                console.log("Fetching movies due to search, or filter change...");
                await fetchMovies(1); // Fetch movies for page 1
            } else {
                isMounted.current = true;
                setPage(1); // Initialize page
                console.log("Fetching movies for the first time...");
                await fetchMovies(1); // Fetch movies for page 1
            }
        }
        fetchMoviesOnMount();
    }, [fetchMovies]);

    useEffect(() => {
        return () => {
            isMounted.current = false; // Cleanup on unmount
            setIsLoading(false); // Reset loading state
            setMovies([]); // Reset movie list
            setPage(1); // Reset page
            setHasMore(true); // Reset infinite scroll state
        };
    }, []);

    return (
        <MoviesContext.Provider
            value={{
                movies,
                fetchMovies,
                page,
                setPage,
                hasMore,
                setHasMore,
            }}
        >
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