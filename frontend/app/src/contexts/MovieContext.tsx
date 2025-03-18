import { createContext, useContext, useState, useEffect } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";
import { useAuth } from "./AuthContext";
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    fetchMovies: (page: number, searchQuery: string, language: string, filterOptions: FilterOptions, sortOptions: SortOptions) => Promise<Movie[]>;
    hasMore: boolean;
    setHasMore: (hasMore: boolean) => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {
    const movieService = new MovieService();
    const { user } = useAuth();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [hasMore, setHasMore] = useState(true);

    async function fetchMovies(
        page: number,
        searchQuery: string,
        language: string,
        filterOptions: FilterOptions,
        sortOptions: SortOptions
    ): Promise<Movie[]> {

        try {
            const response = searchQuery
                ? await movieService.searchMovies(searchQuery, language, page, filterOptions, sortOptions)
                : await movieService.getPopularMovies(page, language, filterOptions, sortOptions);

            if (response.success) {
                if (response.data.length > 0) {
                    setHasMore(true);
                    if (page === 1) {
                        setMovies(response.data);
                    } else {
                        setMovies((prevMovies) => [...prevMovies, ...response.data]);
                    }
                } else {
                    // No more movies to fetch
                    setHasMore(false);
                    if (searchQuery && page === 1) {
                        // No results found for search query
                        setMovies([]);
                    }
                }
                return response.data || [];
            } else {
                setHasMore(false);
                return [];
            }
        } catch (error) {
            setHasMore(false);
            console.log(error);
            return [];
        }

    }

    // Fetch popular movies on component mount
    useEffect(() => {
        const sortOptions: SortOptions = { type: "none", ascending: false };
        const filterOtptions: FilterOptions = {
            genre: "",
            yearRange: [1950, new Date().getFullYear()],
            rating: [0, 10]
        };
        fetchMovies(1, "", user.language, filterOtptions, sortOptions);
    }, [user.language]);

    return (
        <MoviesContext.Provider value={{ movies, setMovies, fetchMovies, hasMore, setHasMore }}>
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