import { useEffect, useRef, useCallback } from "react";
import { useMovies } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { FilterSortMenu } from "../components/FilterSortMenu";
import { CircularProgress, Typography } from "@mui/material";


export default function Home() {

    const { movies, isLoading, hasMore, page, fetchMovies, incrementPage } = useMovies();
    const loadingRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
            hasMore &&
            !isLoading
        ) {
            incrementPage();
        }
    }, [hasMore, isLoading, incrementPage]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (page > 1) {
            fetchMovies(page);
        }
    }, [page, fetchMovies]);

    useEffect(() => {
        if (movies.length === 0 && page === 1 && !isLoading) {
            fetchMovies(1); // Charger la première page si aucun film n'est chargé
        }
    }, [movies, page, isLoading, fetchMovies]);

    return (
        <>
            {isLoading && movies.length === 0 ? (
                <div className="flex justify-center items-center h-screen">
                    <CircularProgress />
                </div>
            ) : movies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                    {movies.map((movie, id) => (
                        <MovieCard key={id} movie={movie} />
                    ))}
                </div>
            )}

            {isLoading && movies.length > 0 && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    <CircularProgress />
                </div>
            )}

            <FilterSortMenu />
        </>
    );
}
