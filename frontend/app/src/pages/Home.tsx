import { useEffect, useState, useRef, useCallback } from 'react';
import MovieCard from '../components/MovieCard.tsx';
import { useMovies } from '../contexts/MovieContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import MovieService from '../services/MovieService.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { Typography } from '@mui/material';


export default function Home() {
    const { user } = useAuth();
    const { movies, setMovies } = useMovies();
    const { searchQuery, setSearchQuery } = useSearch();

    const movieService = new MovieService();
    const [page, setPage] = useState(1);
    const [scroll, setScroll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Fonction pour charger les films (populaires ou via recherche)
    const fetchMovies = useCallback(async (reset = false) => {
        if (isLoading || !hasMore || scroll) return;

        setIsLoading(true);
        try {
            const response = searchQuery
                ? await movieService.searchMovies(searchQuery, user.language, reset ? 1 : page)
                : await movieService.getPopularMovies(reset ? 1 : page, user.language);

            if (!response.success || response.data.length === 0) {
                setHasMore(false);
                return;
            }

            setMovies(reset ? response.data : [...movies, ...response.data]);
            setPage((prevPage) => prevPage + 1);
        } catch (error) {
            console.error("Erreur lors du chargement des films", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, user.language, page, isLoading, hasMore, setMovies, movies, scroll]);

    // Gestion du scroll infini
    useEffect(() => {
        if (!loadingRef.current || !hasMore) return;
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) fetchMovies();
            },
            { rootMargin: "50%" }
        );
        observerRef.current.observe(loadingRef.current);
        return () => observerRef.current?.disconnect();
    }, [fetchMovies, hasMore]);

    // Rechercher les films lorsqu'un nouveau terme de recherche est saisi
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchMovies(true);
        setScroll(true);
    }, [searchQuery, user.language]);

    // Reset de la recherche en quittant la page
    useEffect(() => {
        return () => setSearchQuery("");
    }, []);

    useEffect(() => {
        if (movies.length > 0 && scroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setScroll(false);
        }
    }, [movies, scroll]);

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
                    {isLoading && <p>Loading...</p>}
                </div>
            )}

            <FilterSortMenu onApply={(filters) => console.log(filters)} />
        </>
    );
}
