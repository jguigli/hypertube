import { useEffect, useState, useRef, useCallback } from 'react';
import MovieCard from '../components/MovieCard.tsx';
import { useMovies } from '../contexts/MovieContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { CircularProgress, Typography } from '@mui/material';
import FilterSortOptions, { FilterOptions, SortOptions } from '../types/FilterSortOptions.tsx';

export default function Home() {

    const { user, getToken } = useAuth();
    const { movies, fetchMovies, hasMore, setHasMore, moviesInformation } = useMovies();
    const { searchQuery, setSearchQuery } = useSearch();

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [movieCategory, setMovieCategory] = useState<string>("All");
    const [initialRating, setInitialRating] = useState<number[]>([moviesInformation.rating_min, moviesInformation.rating_max]);
    const [initialYearRange, setInitialYearRange] = useState<number[]>([moviesInformation.release_date_min, moviesInformation.release_date_max]);

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        genre: "All",
        yearRange: initialYearRange,
        rating: initialRating
    });
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        type: "none",
        ascending: false
    });

    const loadingRef = useRef<HTMLDivElement | null>(null);

    // Reset state when searchQuery changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setInitialRating([moviesInformation.rating_min, moviesInformation.rating_max]);
        setInitialYearRange([moviesInformation.release_date_min, moviesInformation.release_date_max]);
        setFilterOptions({
            genre: "All",
            yearRange: initialYearRange,
            rating: initialRating
        });
    }, [searchQuery, moviesInformation]);

    // Reset state when searchQuery or language changes
    useEffect(() => {
        setLoading(true);
        window.scrollTo(0, 0);
    }, [searchQuery, user.language]);

    // Reset searchQuery when language changes
    useEffect(() => {
        setSearchQuery("");
    }, [user.language]);

    // Fetch movies when page, searchQuery or language changes
    const fetchMoviesCallback = useCallback(() => {
        fetchMovies(page, searchQuery, user.language, filterOptions, sortOptions, getToken()).then(
            () => { setLoading(false); }
        );
    }, [page, searchQuery, user.language]);

    useEffect(() => {
        fetchMoviesCallback();
    }, [fetchMoviesCallback]);

    // Infinite scroll
    const handleScroll = useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [loading]);

    useEffect(() => {
        if (!loadingRef.current) {
            return;
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Load default movies on component unmount
    useEffect(() => {
        return () => {
            setSearchQuery("");
            fetchMovies(1, "", user.language, {
                genre: "All",
                rating: [moviesInformation.rating_min, moviesInformation.rating_max],
                yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max]
            }, { type: "none", ascending: false }, getToken());
        }
    }, []);

    const applyFilterSort = (filters: FilterSortOptions) => {
        const { filterOptions, sortOptions } = filters;

        setLoading(true);
        setFilterOptions(filterOptions);
        setSortOptions(sortOptions);
        setPage(1);
        setHasMore(true);
        fetchMovies(1, searchQuery, user.language, filterOptions, sortOptions, getToken()
        ).then(() => {
            setInitialRating(filterOptions.rating);
            setInitialYearRange(filterOptions.yearRange);
            setMovieCategory(filterOptions.genre);
            setLoading(false);
        });
    };

    return (
        <>
            {loading ?
                <CircularProgress /> :
                (
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

                        {hasMore && (
                            <div ref={loadingRef} className="flex justify-center py-4">
                                {loading && <p>Loading...</p>}
                            </div>
                        )}

                        <FilterSortMenu
                            onApply={applyFilterSort}
                            sortOptionsLabel={
                                sortOptions.type === "none" ? "none" : `${sortOptions.type}.${sortOptions.ascending ? 'asc' : 'desc'}`
                            }
                            initialYearRange={initialYearRange}
                            initialRating={initialRating}
                            movieCategory={movieCategory}
                        />
                    </>
                )
            }
        </>
    );
}
