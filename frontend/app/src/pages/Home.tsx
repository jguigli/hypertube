import MovieCard from '../components/MovieCard.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext.tsx';
import Movie from '../types/Movie.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MovieService from '../services/MovieService.tsx';
import { FilterSortMenu } from '../components/FilterSortMenu.tsx';


export default function Home() {

    const { user } = useAuth();
    const { movies, setMovies } = useMovies();
    const { searchQuery } = useSearch();

    const [displayedMovies, setDisplayedMovies] = useState(movies);
    const [page, setPage] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sortOption, setSortOption] = useState("");
    const [filterOption, setFilterOption] = useState("all");

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Check if there is (access_token, token_type and context) in the url params
        // If yes, navigate to the reset password page
        // If no, display the home page
        const urlParams = new URLSearchParams(window.location.search);
        const access_token = urlParams.get('access_token');
        const token_type = urlParams.get('token_type');
        const context = urlParams.get('context');
        if (access_token && token_type && context === 'reset_password') {
            navigate(`/reset-password?access_token=${access_token}&token_type=${token_type}&context=${context}`);
        }
    }, [navigate]);

    // const applySortAndFilter = (movies: Movie[]) => {
    //     let filteredMovies = movies;
    //     if (filterOption !== "all") {
    //         // filteredMovies = filteredMovies.filter(movie => movie.genres.includes(filterOption));
    //     }
    //     if (sortOption === "rating") {
    //         filteredMovies.sort((a, b) => b.vote_average - a.vote_average);
    //     } else if (sortOption === "year") {
    //         // filteredMovies.sort((a, b) => b.release_date - a.release_date);
    //     }
    //     return filteredMovies;
    // };

    // Fonction pour récupérer les films depuis l'API
    const movieService = new MovieService();

    const fetchMovies = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {

            const popularMovies = await movieService.getPopularMovies(page, 'en');

            if (popularMovies.length === 0) {
                setHasMore(false);
            } else {
                const updatedMovies = [...movies, ...popularMovies];
                setMovies(updatedMovies);
                // setDisplayedMovies(applySortAndFilter(updatedMovies));
                setPage((prevPage) => prevPage + 1);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des films", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoading, hasMore, setMovies, movies, sortOption, filterOption]);

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
    }, [searchQuery, movies, user]);

    // Intersection Observer pour détecter le scroll
    useEffect(() => {
        if (!loadingRef.current || !hasMore || searchQuery) return;


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
    }, [fetchMovies, hasMore, searchQuery]);

    const handleSortChange = (event: SelectChangeEvent) => {
        setSortOption(event.target.value);
        // Fetch new movies sorted by the selected option
        // The scroll observer will take care of loading more movies
        setPage(1);
        setHasMore(true);
        setMovies([]);
    };

    const handleFilterChange = (event: SelectChangeEvent) => {
        setFilterOption(event.target.value);
        // Fetch new movies sorted by the selected option
        // The scroll observer will take care of loading more movies
        setPage(1);
        setHasMore(true);
        setMovies([]);
    };

    return (
        <>
            {displayedMovies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center p-4">
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
