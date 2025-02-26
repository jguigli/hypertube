import MovieCard from '../components/MovieCard.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext.tsx';
import Movie from '../types/Movie.tsx';
import { IconButton } from '@mui/material';
import { ArrowUpward, Key, KeyboardArrowUp } from '@mui/icons-material';


export default function Home() {
    const { searchQuery } = useSearch();
    const { movies, setMovies } = useMovies();

    const [displayedMovies, setDisplayedMovies] = useState(movies);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    // Fonction pour récupérer les films depuis l'API
    const fetchMovies = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            // const response = await fetch(`/api/movies?page=${page}`);
            // const newMovies = await response.json();

            // Mock response
            const newMovies: Movie[] = [
                {
                    id: Math.random(),
                    title: "Movie 1",
                    production_year: 2021,
                    rating: 5,
                    poster_path: "https://via.placeholder.com/300",
                    watched: false,
                },
                {
                    id: Math.random(),
                    title: "Movie 2",
                    production_year: 2021,
                    rating: 5,
                    poster_path: "https://via.placeholder.com/300",
                    watched: false,
                },
                {
                    id: Math.random(),
                    title: "Movie 3",
                    production_year: 2021,
                    rating: 5,
                    poster_path: "https://via.placeholder.com/300",
                    watched: false,
                }
            ];

            if (newMovies.length === 0) {
                setHasMore(false);
            } else {
                setMovies([...movies, ...newMovies]);
                setPage((prevPage) => prevPage + 1);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des films", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoading, hasMore, setMovies]);

    // Filtrer les films selon la recherche
    useEffect(() => {
        if (searchQuery === "") {
            setDisplayedMovies(movies);
        } else {
            setDisplayedMovies(
                movies.filter((movie) =>
                    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, movies]);

    // Intersection Observer pour détecter le scroll
    useEffect(() => {
        if (!loadingRef.current) return;

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
    }, [fetchMovies]);




    return (
        <>
            {displayedMovies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center p-4">
                    {displayedMovies.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div>
            )}

            {/* Loader pour charger plus de films */}
            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    {isLoading ? <p>Loading...</p> : <p>Scroll to load more...</p>}
                </div>
            )}



        </>
    );
}
