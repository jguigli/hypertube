import { createContext, useState, useEffect, useContext, useCallback } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";
import { useAuth } from "./AuthContext";
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";


export interface MoviesInformation {
    release_date_min: number;
    release_date_max: number;
    rating_min: number;
    rating_max: number;
    genres: string[];
}

interface MoviesContextType {
    movies: Movie[];
    fetchMovies: (page?: number) => Promise<void>;
    filterOptions: FilterOptions;
    setFilterOptions: (options: FilterOptions) => void;
    sortOptions: SortOptions;
    setSortOptions: (options: SortOptions) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    hasMore: boolean;
    moviesInformation: MoviesInformation;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const movieService = new MovieService();

    const { user, getToken } = useAuth();

    const [movies, setMovies] = useState<Movie[]>([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [moviesInformation, setMoviesInformation] = useState<MoviesInformation>({
        release_date_min: 0,
        release_date_max: 0,
        rating_min: 0,
        rating_max: 0,
        genres: []
    });

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        genre: "All",
        yearRange: [0, 0],
        rating: [0, 0]
    });

    const [sortOptions, setSortOptions] = useState<SortOptions>({
        type: "none",
        ascending: false
    });

    const fetchMovies = useCallback(async () => {
        const token = getToken();
        try {
            const response = searchQuery
                ? await movieService.searchMovies(searchQuery, user.language, page, filterOptions, sortOptions, token)
                : await movieService.getPopularMovies(page, user.language, filterOptions, sortOptions, token);

            if (response.success) {
                setMovies((prevMovies) => (page === 1 ? response.data : [...prevMovies, ...response.data]));
                setHasMore(response.data.length > 0);
                setPage((prevPage) => prevPage + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch movies:", error);
            setHasMore(false);
        }
    }, [searchQuery, user.language, filterOptions, sortOptions, page, getToken]);

    const fetchMoviesInformation = useCallback(async () => {
        const token = getToken();
        try {
            const response = await movieService.getMoviesInformation(token, user.language);
            if (response.success) {
                setMoviesInformation({
                    release_date_min: response.data.release_date.min,
                    release_date_max: response.data.release_date.max,
                    rating_min: response.data.vote_average.min,
                    rating_max: response.data.vote_average.max,
                    genres: ["All", ...response.data.genres]
                });
                setFilterOptions({
                    genre: "All",
                    yearRange: [response.data.release_date.min, response.data.release_date.max],
                    rating: [response.data.vote_average.min, response.data.vote_average.max]
                });
                setPage(1);
                setMovies([]);
                setHasMore(true);
            }
        } catch (error) {
            console.error("Failed to fetch movies information:", error);
        }
    }, [user.language]);

    useEffect(() => {
        fetchMoviesInformation();
    }, [fetchMoviesInformation]);

    return (
        <MoviesContext.Provider
            value={{
                movies,
                fetchMovies,
                filterOptions,
                setFilterOptions,
                sortOptions,
                setSortOptions,
                searchQuery,
                setSearchQuery,
                hasMore,
                moviesInformation
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