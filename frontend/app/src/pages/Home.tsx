import MovieCard from '../components/MovieCard.tsx';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import MovieService from '../services/MovieService.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';


export default function Home() {

    const { user } = useAuth();
    const { movies, setMovies } = useMovies();
    const { searchQuery } = useSearch();

    const movieService = new MovieService();

    const [displayedMovies, setDisplayedMovies] = useState(movies);

    const [page, setPage] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    // Fonction pour récupérer les films depuis l'API
    const fetchMovies = useCallback(async () => {
        if (isLoading || !hasMore) return;
        try {
            setIsLoading(true);
            if (searchQuery) {
                const searchMoviesResponse = await movieService.searchMovies(searchQuery, user.language, page);
                if (!searchMoviesResponse.success) {
                    setHasMore(false);
                    return;
                }
                setDisplayedMovies([...displayedMovies, ...searchMoviesResponse.data]);
            } else {
                const popularMoviesResponse = await movieService.getPopularMovies(page, user.language);
                if (!popularMoviesResponse.success) {
                    setHasMore(false);
                    return;
                }
                setDisplayedMovies([...displayedMovies, ...popularMoviesResponse.data]);
            }
            setPage((prevPage) => prevPage + 1);
        } catch (error) {
            console.error("Erreur lors du chargement des films", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoading, hasMore, setMovies, movies, displayedMovies, searchQuery, user.language]);

    // Intersection Observer pour détecter le scroll
    useEffect(() => {
        if (!loadingRef.current || !hasMore) return;
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMovies();
                }
            },
            { rootMargin: "50%" }
            // Déclenche fetchMovies() en fonction de la position du scroll
        );
        observerRef.current.observe(loadingRef.current);
        return () => observerRef.current?.disconnect();
    }, [fetchMovies, hasMore]);

    useEffect(() => {
        setPage(2);
        setHasMore(true);
        setDisplayedMovies(movies);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [movies, searchQuery]);

    useEffect(() => {
        movieService.getPopularMovies(1, user.language)
            .then((response) => {
                if (!response.success) {
                    return;
                }
                setMovies(response.data);
            });
    }, [user.language]);

    return (
        <>
            {displayedMovies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full place-items-center p-4">
                    {displayedMovies.map((movie, id) => (
                        <MovieCard movie={movie} key={id} />
                    ))}
                </div>
            )}

            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    {isLoading && (<p>Loading...</p>)}
                </div>
            )}

            <FilterSortMenu onApply={(filters) => console.log(filters)} />
        </>
    );
}
