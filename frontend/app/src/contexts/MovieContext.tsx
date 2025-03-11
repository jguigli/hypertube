import { createContext, useContext, useState, useEffect } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    fetchMovies: (page: number, searchQuery: string, language: string, reset?: boolean) => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {
    const movieService = new MovieService();

    const [movies, setMovies] = useState<Movie[]>([]);

    async function fetchMovies(
        page: number,
        searchQuery: string,
        language: string,
    ) {
        const response = searchQuery
                ? await movieService.searchMovies(searchQuery, language, page)
                : await movieService.getPopularMovies(page, language);

        if (response.success) {
            if (page === 1) {
                setMovies(response.data);
            } else {
                setMovies([...movies, ...response.data]);
            }
        }
    }

    // // Fetch popular movies on component mount
    // useEffect(() => {
    //     fetchMovies(1, "", user.language);
    // }, []);

    return (
        <MoviesContext.Provider value={{ movies, setMovies, fetchMovies }}>
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