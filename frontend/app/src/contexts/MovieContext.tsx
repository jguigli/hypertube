import { createContext, useContext, useState, useEffect } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";
import { useAuth } from "./AuthContext";
import { set } from "video.js/dist/types/tech/middleware";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    fetchMovies: (page: number, searchQuery: string, language: string) => Promise<Movie[]>;
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
    ): Promise<Movie[]> {

        try {
            const response = searchQuery
                ? await movieService.searchMovies(searchQuery, language, page)
                : await movieService.getPopularMovies(page, language);

            if (response.success) {
                if (page === 1) {
                    setMovies(response.data);
                } else {
                    setMovies((prevMovies) => [...prevMovies, ...response.data]);
                }
            } else {
                setHasMore(false);
                if (response.error === "No more movies available" && searchQuery && page === 1) {
                    setMovies([]);
                    return [];
                } else {
                    return [];
                }
            }
            return response.data || [];
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    // Fetch popular movies on component mount
    useEffect(() => {
        fetchMovies(1, "", user.language);
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