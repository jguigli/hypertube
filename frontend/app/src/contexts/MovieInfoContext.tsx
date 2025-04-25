import { createContext, useContext, useState } from "react";
import Movie from "../types/Movie";

interface MovieInfoType {
    movie: Movie | null;
    setMovie: React.Dispatch<React.SetStateAction<Movie | null>>;
}

const MovieInfoContext = createContext<MovieInfoType | undefined>(undefined);

export function MovieInfoProvider({ children }: { children: React.ReactNode }) {

    const [movie, setMovie] = useState<Movie | null>(null);

    return (
        <MovieInfoContext.Provider value={{ movie, setMovie }}>
            {children}
        </MovieInfoContext.Provider>
    );

}

export function useMovieInfo() {
    const context = useContext(MovieInfoContext);
    if (!context) {
        throw new Error("useMovieInfo must be used within a MovieInfoProvider");
    }
    return context;
}

