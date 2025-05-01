import { createContext, useState, useEffect, useContext, useCallback } from "react";
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
    // This state holds the movies fetched from the API
    const [movies, setMovies] = useState<Movie[]>([]);


    // Fetch movies function
    // This function fetches movies from the API
    // If a search query is provided, it fetches movies based on the search query
    // If no search query is provided, it fetches popular movies
    // The function is called when the component mounts and when the user changes the filter options,
    const fetchMovies = useCallback(async (newPage: number = 1) => {
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
        }
    }, [searchQuery, filterOptions, sortOptions, user.language]);

    useEffect(() => {
        const loadMovies = async () => {
            setIsLoading(true);
            setPage(1);
            setMovies([]);
            setHasMore(true);
    
            try {
                await fetchMovies(1);
            } finally {
                setIsLoading(false);
            }
        };
    
        loadMovies();
    }, [searchQuery, filterOptions, sortOptions, user.language]);

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