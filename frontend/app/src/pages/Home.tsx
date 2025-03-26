import { useEffect, useRef } from "react";
import { useMovies } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { FilterSortMenu } from "../components/FilterSortMenu";
import { CircularProgress, Typography } from "@mui/material";

export default function Home() {
    const { movies, fetchMovies, isLoading, hasMore, searchQuery, setPage } = useMovies();
    const loadingRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchMovies(); // Fetch movies on component mount
    }, []);

    const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore) {
            // fetchMovies();
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll, hasMore]); // Ensure hasMore is included in dependencies

    return (
        <>
            <div className="flex justify-center items-center">
                <Typography variant="h6" color="secondary">
                    {searchQuery ? `Search results for "${searchQuery}"` : "Popular movies"}
                </Typography>
            </div>

            {movies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                    {movies.map((movie, id) => (
                        <MovieCard movie={movie} key={id} />
                    ))}
                </div>
            )}

            {(hasMore && isLoading) && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    <CircularProgress />
                </div>
            )}

            <FilterSortMenu />
        </>
    );
}
