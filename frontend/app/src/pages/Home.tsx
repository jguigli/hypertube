import { useEffect, useRef } from "react";
import { useMovies } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { FilterSortMenu } from "../components/FilterSortMenu";
import { CircularProgress, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useLoading } from "../contexts/LoadingContext";


export default function Home() {

    const { t } = useTranslation();
    const { movies, fetchNextPage, hasMore } = useMovies();
    const { isLoading } = useLoading();
    const observerRef = useRef<HTMLDivElement | null>(null);


    // Infinite scroll observer
    useEffect(() => {
        if (!hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                threshold: 1,
                rootMargin: "400px"
            }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [isLoading, hasMore, fetchNextPage]); // Dépendances minimales

    return (
        <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                {movies.map((movie, id) => (
                    <MovieCard key={id} movie={movie} />
                ))}
            </div>
            <div ref={observerRef} style={{ height: 40 }} />
            {(movies.length === 0) && (
                <>
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full" >
                            <CircularProgress />
                            <Typography variant="body2" color="textSecondary" className="mt-2">
                                {t("Loading movies...")}
                            </Typography>
                        </div >
                    ) : (
                        <Typography variant="h6" color="textSecondary" className="mt-4">
                            {t("No movies found")}
                        </Typography>
                    )}
                </>
            )}
            <FilterSortMenu />
        </>
    );
}
