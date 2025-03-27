import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
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
    filterOptions: FilterOptions;
    setFilterOptions: (options: FilterOptions) => void;
    sortOptions: SortOptions;
    setSortOptions: (options: SortOptions) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    hasMore: boolean;
    moviesInformation: MoviesInformation;
    isLoading: boolean;
    page: number;
    fetchMovies: (newPage?: number) => void;
    incrementPage: () => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const movieService = new MovieService();

    const { user, getToken } = useAuth();

    // Movies information used for filter options
    // This state holds the information about the movies for filtering purposes
    // When the component mounts, the information is fetched from the API
    // When the user changes it's language, the information is fetched again
    const [moviesInformation, setMoviesInformation] = useState<MoviesInformation>({
        release_date_min: 0,
        release_date_max: 0,
        rating_min: 0,
        rating_max: 0,
        genres: []
    });

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
                    genres: response.data.genres
                });
                setFilterOptions({
                    genre: "All",
                    yearRange: [response.data.release_date.min, response.data.release_date.max],
                    rating: [response.data.vote_average.min, response.data.vote_average.max]
                });
                setMovies([]);
                setHasMore(true);
            }
        } catch (error) {
            console.error("Failed to fetch movies information:", error);
        }
    }, [user]);

    useEffect(() => {
        fetchMoviesInformation();
    }, [fetchMoviesInformation]);

    // Movies state
    // This state holds the movies fetched from the API
    const [movies, setMovies] = useState<Movie[]>([]);

    // hasMore state used to avoid multiple call in infinite scrolling
    const [hasMore, setHasMore] = useState(true);

    // Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // Filter and sort options states
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        genre: "All",
        yearRange: [0, 0],
        rating: [0, 0]
    });

    const [sortOptions, setSortOptions] = useState<SortOptions>({
        type: "none",
        ascending: false
    });

    // Reset filter and sort options when the user changes the language
    useEffect(() => {
        setFilterOptions({
            genre: "All",
            yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
            rating: [moviesInformation.rating_min, moviesInformation.rating_max]
        });
        setSortOptions({
            type: "none",
            ascending: false
        });
    }, [user.language, moviesInformation]);

    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1); // Ajout de l'état page

    const isLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    // Fetch movies function
    // This function fetches movies from the API
    // If a search query is provided, it fetches movies based on the search query
    // If no search query is provided, it fetches popular movies
    // The function is called when the component mounts and when the user changes the filter options,
    const fetchMovies = useCallback(async (newPage: number = 1) => {
        if (!hasMoreRef.current || isLoadingRef.current) return;

        isLoadingRef.current = true;
        setIsLoading(true);

        const token = getToken();
        const response = searchQuery
            ? await movieService.searchMovies(searchQuery, user.language, newPage, filterOptions, sortOptions, token)
            : await movieService.getPopularMovies(newPage, user.language, filterOptions, sortOptions, token);

        if (response.success) {
            setMovies((prevMovies) => {
                const newMovies = response.data.filter(
                    (movie: Movie) => !prevMovies.some((prevMovie) => prevMovie.id === movie.id)
                );
                return newPage === 1 ? response.data : [...prevMovies, ...newMovies];
            });
            setHasMore(response.data.length > 0);
        } else {
            setHasMore(false);
        }

        isLoadingRef.current = false;
        setIsLoading(false);
    }, [searchQuery, user.language, filterOptions, sortOptions, getToken]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            // setIsLoading(false);
            setHasMore(true);
            fetchMovies();
        }, 300); // Ajouter un délai pour regrouper les changements
        return () => clearTimeout(timeout);
    }, [user, user.language, filterOptions, sortOptions, searchQuery]);

    useEffect(() => {
        setPage(1); // Réinitialiser la page à 1
        setMovies([]); // Réinitialiser les films
        setHasMore(true); // Réinitialiser la pagination
        fetchMovies(1); // Charger la première page
    }, [user, user.language, filterOptions, sortOptions, searchQuery]);

    const incrementPage = useCallback(() => {
        setPage((prevPage) => {
            if (!hasMoreRef.current || isLoadingRef.current) {
                return prevPage;
            }
            return prevPage + 1;
        });
    }, []);


    return (
        <MoviesContext.Provider
            value={{
                movies,
                filterOptions,
                setFilterOptions,
                sortOptions,
                setSortOptions,
                searchQuery,
                setSearchQuery,
                hasMore,
                moviesInformation,
                isLoading,
                page,
                incrementPage, // Exposez la fonction pour incrémenter la page
                fetchMovies
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