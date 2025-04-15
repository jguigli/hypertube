import { useEffect, useRef, useCallback } from "react";
import { useMovies } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { FilterSortMenu } from "../components/FilterSortMenu";
import { CircularProgress, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';


export default function Home() {

    const { movies, isLoading, hasMore, page, fetchMovies, incrementPage, resetSearch, resetFilter, resetSort } = useMovies();
    const loadingRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

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
            fetchMovies(1);
        }
    }, [movies, page, isLoading, fetchMovies]);

    // Reset search and filter when the component unmounts
    useEffect(() => {
        return () => {
            resetSearch();
            resetFilter();
            resetSort();
        };
    }, []);

    return (
        <>
            {isLoading && movies.length === 0 ? (
                <div className="flex justify-center items-center h-screen">
                    <CircularProgress />
                </div>
            ) : movies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">{t("No movies found")}</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                    {movies.map((movie, id) => (
                        <MovieCard key={id} movie={movie} />
                    ))}
                </div>
            )}

            {isLoading && (
                <>
                    <div ref={loadingRef} className="flex justify-center py-4">
                        <CircularProgress />
                    </div>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        {t("Loading more movies...")}
                    </Typography>
                </>
            )}

    <FilterSortMenu />
        </>
    );
}
