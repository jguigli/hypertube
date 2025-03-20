import { createContext, useState, useEffect, useContext } from "react";
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
    setMovies: (movies: Movie[]) => void;
    fetchMovies: (page: number, searchQuery: string, language: string, filterOptions: FilterOptions, sortOptions: SortOptions) => Promise<Movie[]>;
    hasMore: boolean;
    setHasMore: (hasMore: boolean) => void;
    moviesInformation: MoviesInformation;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);


export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const movieService = new MovieService();
    const { user, getToken } = useAuth();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [moviesInformation, setMoviesInformation] = useState<MoviesInformation>({
        release_date_min:  0,
        release_date_max: 0,
        rating_min: 0,
        rating_max: 0,
        genres: []
    });
    const [loading, setLoading] = useState(true);

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
                    setHasMore(false);
                    if (searchQuery && page === 1) {
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

    async function getMoviesInfo() {
        const token = getToken();
        try {
            const response = await movieService.getMoviesInformation(token);
            if (response.success) {
                setMoviesInformation({
                    release_date_min: response.data.release_date.min,
                    release_date_max: response.data.release_date.max,
                    rating_min: response.data.vote_average.min,
                    rating_max: response.data.vote_average.max,
                    genres: response.data.genres
                });
            }
        } catch (error) {
            console.error("Failed to fetch movies information:", error);
        } finally {
            setLoading(false); // Fin du chargement
        }
    }

    useEffect(() => {
        getMoviesInfo();
    }, []);

    useEffect(() => {
        if (!loading) {
            const defaultFilterOptions: FilterOptions = {
                yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
                rating: [moviesInformation.rating_min, moviesInformation.rating_max]
            };
            const defaultSortOptions: SortOptions = { type: "none", ascending: false };
            
            fetchMovies(1, "", user.language, defaultFilterOptions, defaultSortOptions);
        }
    }, [user.language, moviesInformation, loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <MoviesContext.Provider value={{ movies, setMovies, fetchMovies, hasMore, setHasMore, moviesInformation }}>
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