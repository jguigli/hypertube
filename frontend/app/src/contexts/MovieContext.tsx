import { createContext, useContext, useState } from "react";
import Movie from "../types/Movie";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    sortMovies: (sortType: string) => void;
    filterMovies: (filterType: string, value: any) => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const [movies, setMovies] = useState<Movie[]>([
        {
            id: 1,
            watched: true,
            title: 'Inception',
            rating: Math.random() * 10,
            production_year: 2010,
            poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg'
        },
        {
            id: 2,
            watched: true,
            title: 'The Matrix',
            rating: Math.random() * 10,
            production_year: 1999,
            poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png'
        },
        {
            id: 3,
            watched: false,
            title: 'Interstellar',
            rating: Math.random() * 10,
            production_year: 2014,
            poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg'
        },
        {
            id: 4,
            watched: false,
            title: 'Enter the Void',
            rating: Math.random() * 10,
            production_year: 2009,
            poster_path: 'https://m.media-amazon.com/images/M/MV5BMjEzNzMzNzQzNl5BMl5BanBnXkFtZTcwNjExMTE3Mw@@._V1_.jpg'
        },
        {
            id: 5,
            title: "The Godfather",
            production_year: 1972,
            rating: 9.2,
            poster_path: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
            watched: true,
        },
        {
            id: 6,
            title: "The Dark Knight",
            production_year: 2008,
            rating: 9.0,
            poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            watched: false,
        },
    ]);

    function sortMovies(sortType: string) {
        if (sortType === "rating") {
            setMovies([...movies].sort((a, b) => b.rating - a.rating));
        } else if (sortType === "year") {
            setMovies([...movies].sort((a, b) => b.production_year - a.production_year));
        }
    }

    function filterMovies(filterType: string, value: string) {
        if (filterType === "name") {
            setMovies([...movies].filter((movie) => movie.title.toLowerCase().includes(value.toLowerCase())));
        } else if (filterType === "watched") {
            setMovies([...movies].filter((movie) => movie.watched));
        } else if (filterType === "unwatched") {
            setMovies([...movies].filter((movie) => !movie.watched));
        }
    }

    return (
        <MoviesContext.Provider value={{ movies, setMovies, sortMovies, filterMovies }}>
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