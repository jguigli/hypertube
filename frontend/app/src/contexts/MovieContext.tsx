import { createContext, useContext, useState, useEffect } from "react";
import Movie from "../types/Movie";
import MovieService from "../services/MovieService";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    updateMovie: (id: number, newMovie: Movie) => void;

}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {
    const movieService = new MovieService();

    const [movies, setMovies] = useState<Movie[]>([]);

    // Fetch popular movies on component mount
    useEffect(() => {
        const fetchMovies = async () => {
            const popularMovies = await movieService.getPopularMovies(1, "en");
            setMovies(popularMovies);
        };
        fetchMovies();
    }, []);

    function updateMovie(id: number, newMovie: Movie) {
        const index = movies.findIndex(mov => mov.id === id)
        if (index === -1) {
            return ;
        }
        movies[index] = newMovie;
    }

    return (
        <MoviesContext.Provider value={{ movies, setMovies, updateMovie }}>
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