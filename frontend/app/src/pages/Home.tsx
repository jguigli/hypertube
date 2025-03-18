import { useEffect, useState, useRef, useCallback, use } from 'react';
import MovieCard from '../components/MovieCard.tsx';
import { useMovies } from '../contexts/MovieContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { CircularProgress, Typography } from '@mui/material';
import FilterSortOptions, { FilterOptions, SortOptions } from '../types/FilterSortOptions.tsx';

export default function Home() {

    const { user } = useAuth();
    const { movies, fetchMovies, hasMore, setHasMore } = useMovies();
    const { searchQuery, setSearchQuery } = useSearch();
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    const [sortOptions, setSortOptions] = useState<SortOptions>({
        type: "none",
        ascending: false
    });

    // Reset state when searchQuery changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [searchQuery]);

    // Reset state when searchQuery or language changes
    useEffect(() => {
        setLoading(true);
        window.scrollTo(0, 0);
    }, [searchQuery, user.language, sortOptions]);

    // Reset searchQuery when language changes
    useEffect(() => {
        setSearchQuery("");
    }, [user.language]);

    // Fetch movies when page, searchQuery or language changes
    const fetchMoviesCallback = useCallback(() => {
        fetchMovies(page, searchQuery, user.language, sortOptions).then(
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
            fetchMovies(1, "", user.language, { type: "none", ascending: false });
        }
    }, []);

    const applyFilterSort = (filters: FilterSortOptions) => {

        const { filterOptions, sortOptions } = filters;

        console.log(filterOptions);
        console.log(sortOptions);

        // Fetch movies with filters and sort options

        setLoading(true);
        setSortOptions(sortOptions);
        setPage(1);
        setHasMore(true);

        fetchMovies(page, searchQuery, user.language, sortOptions).then(() => {
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

                        <FilterSortMenu onApply={applyFilterSort} />
                    </>
                )
            }
        </>
    );
}
