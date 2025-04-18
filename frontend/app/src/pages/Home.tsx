import { useEffect, useRef, useCallback } from "react";
import { useMovies } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import { FilterSortMenu } from "../components/FilterSortMenu";
import { CircularProgress, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';


export default function Home() {

    const { t } = useTranslation();
    const { movies } = useMovies();
    // const loadingRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            {/* <div className="flex flex-col justify-center items-center position-sticky top-0 left-0 right-0 z-10 opacity-80">
                <h1>Debug panel</h1>
                <div className="flex flex-col">
                    <p>Page: {page}</p>
                    <p>Has More: {hasMore ? "true" : "false"}</p>
                    <p>Loading: {isLoading ? "true" : "false"}</p>
                    <p>Movies Length: {movies.length}</p>
                    {
                        movies.map((movie, index) => (
                            <div key={index}>
                                <p>Title: {movie.title}</p>
                                <hr />
                            </div>
                        ))
                    }
                </div>
            </div> */}
            {/* {(isLoading && movies.length === 0) ? (
                <div className="flex flex-col justify-center items-center h-full">
                    <div ref={loadingRef} className="flex justify-center py-4">
                        <CircularProgress />
                    </div>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        {t("Loading more movies...")}
                    </Typography>
                </div>
            ) : movies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">{t("No movies found")}</p>
                </div>
            ) : ( */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                    {movies.map((movie, id) => (
                        <MovieCard key={id} movie={movie} />
                    ))}
                </div>
            {/* )} */}
            <FilterSortMenu />
        </>
    );
}
