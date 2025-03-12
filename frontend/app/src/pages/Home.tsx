import { useEffect, useState, useRef, useCallback } from 'react';
import MovieCard from '../components/MovieCard.tsx';
import { useMovies } from '../contexts/MovieContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { Typography } from '@mui/material';
import { set } from 'video.js/dist/types/tech/middleware';

export default function Home() {
    const { user } = useAuth();
    const { movies, fetchMovies, hasMore, setHasMore } = useMovies();
    const { searchQuery, setSearchQuery } = useSearch();
    const [page, setPage] = useState(1);

    const [scroll, setScroll] = useState(false);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setLoading(true);
        if (searchQuery) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setLoading(false);
        setPage(1);
        setHasMore(true);
        setScroll(true);
    }, [searchQuery]);

    const fetchMoviesCallback = useCallback(() => {
        setLoading(true);
        fetchMovies(page, searchQuery, user.language).then((newMovies) => {
            setHasMore(newMovies?.length > 0);
            setLoading(false);
        });
    }, [page, searchQuery, user.language]);

    useEffect(() => {
        fetchMoviesCallback();
    }, [fetchMoviesCallback]);


    const handleScroll = useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [loading]);

    useEffect(() => {
        if (!loadingRef.current || !hasMore) return;
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, handleScroll]);

    useEffect(() => {
        return () => setSearchQuery("");
    }, []);

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

            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    {loading && <p>Loading...</p>}
                </div>
            )}

            <FilterSortMenu onApply={(filters) => console.log(filters)} />
        </>
    );
}
