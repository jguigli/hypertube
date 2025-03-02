import MovieCard from '../components/MovieCard.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMovies } from '../contexts/MovieContext.tsx';
import Movie from '../types/Movie.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function Home() {

    const { user } = useAuth();
    const { movies, setMovies } = useMovies();
    const { searchQuery } = useSearch();

    const [displayedMovies, setDisplayedMovies] = useState(movies);
    const [page, setPage] = useState(1);
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

    const applySortAndFilter = (movies: Movie[]) => {
        let filteredMovies = movies;
        if (filterOption !== "all") {
            filteredMovies = filteredMovies.filter(movie => movie.genres.includes(filterOption));
        }
        if (sortOption === "rating") {
            filteredMovies.sort((a, b) => b.imdb_rating - a.imdb_rating);
        } else if (sortOption === "year") {
            filteredMovies.sort((a, b) => b.production_year - a.production_year);
        }
        return filteredMovies;
    };

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
                    imdb_id: Math.random().toString(36).substring(7),
                    production_year: 1994,
                    imdb_rating: 9.3,
                    watched: false,
                    language: {
                        en: {
                            title: "The Shawshank Redemption",
                            poster_path: "/path/to/poster_en.jpg",
                            audio: "English"
                        },
                        fr: {
                            title: "Les Évadés",
                            poster_path: "/path/to/poster_fr.jpg",
                            audio: "French"
                        }
                    },
                    videos_quality: {
                        sd_url: "/path/to/sd.mp4",
                        hd_url: "/path/to/hd.mp4",
                        full_hd_url: "/path/to/full_hd.mp4"
                    },
                    nb_downloads: 1000,
                    nb_peers: 200,
                    nb_seeders: 150,
                    genres: ["Drama"],
                    summary: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                    casting: {
                        producer: "Niki Marvin",
                        director: "Frank Darabont",
                        actors: ["Tim Robbins", "Morgan Freeman"]
                    }
                },
                {
                    imdb_id: Math.random().toString(36).substring(7),
                    production_year: 1972,
                    imdb_rating: 9.2,
                    watched: true,
                    language: {
                        en: {
                            title: "The Godfather",
                            poster_path: "/path/to/poster_en.jpg",
                            audio: "English"
                        },
                        fr: {
                            title: "Le Parrain",
                            poster_path: "/path/to/poster_fr.jpg",
                            audio: "French"
                        }
                    },
                    videos_quality: {
                        sd_url: "/path/to/sd.mp4",
                        hd_url: "/path/to/hd.mp4",
                        full_hd_url: "/path/to/full_hd.mp4"
                    },
                    nb_downloads: 2000,
                    nb_peers: 300,
                    nb_seeders: 250,
                    genres: ["Crime", "Drama"],
                    summary: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                    casting: {
                        producer: "Albert S. Ruddy",
                        director: "Francis Ford Coppola",
                        actors: ["Marlon Brando", "Al Pacino"]
                    }
                },
                {
                    imdb_id: Math.random().toString(36).substring(7),
                    production_year: 2008,
                    imdb_rating: 9.0,
                    watched: false,
                    language: {
                        en: {
                            title: "The Godfather",
                            poster_path: "/path/to/poster_en.jpg",
                            audio: "English"
                        },
                        fr: {
                            title: "Le Parrain",
                            poster_path: "/path/to/poster_fr.jpg",
                            audio: "French"
                        }
                    },
                    videos_quality: {
                        sd_url: "/path/to/sd.mp4",
                        hd_url: "/path/to/hd.mp4",
                        full_hd_url: "/path/to/full_hd.mp4"
                    },
                    nb_downloads: 2000,
                    nb_peers: 300,
                    nb_seeders: 250,
                    genres: ["Crime", "Drama"],
                    summary: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                    casting: {
                        producer: "Albert S. Ruddy",
                        director: "Francis Ford Coppola",
                        actors: ["Marlon Brando", "Al Pacino"]
                    }
                },

            ];

            if (newMovies.length === 0) {
                setHasMore(false);
            } else {
                const updatedMovies = [...movies, ...newMovies];
                setMovies(updatedMovies);
                setDisplayedMovies(applySortAndFilter(updatedMovies));
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
            const userLanguage = user.language;
            setDisplayedMovies(
                movies.filter((movie) =>
                    movie.language[userLanguage].title.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {displayedMovies.map((movie) => (
                        <MovieCard movie={movie} key={movie.imdb_id} />
                    ))}
                </div>
            )}

            {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-4">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        !searchQuery && <p>Scroll to load more...</p>
                    )}
                </div>
            )}

            <Card className="fixed bottom-4 rounded-full bg-white shadow-md flex gap-4 p-4">
                <FormControl variant="outlined" size="small">
                    <InputLabel>Sort by</InputLabel>
                    <Select
                        value={sortOption}
                        onChange={handleSortChange}
                        label="Sort by"
                    >
                        <MenuItem value="rating">Rating</MenuItem>
                        <MenuItem value="year">Production Year</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Filter by</InputLabel>
                    <Select
                        value={filterOption}
                        onChange={handleFilterChange}
                        label="Filter by"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Drama">Drama</MenuItem>
                        <MenuItem value="Action">Action</MenuItem>
                        <MenuItem value="Sci-Fi">Sci-Fi</MenuItem>
                        <MenuItem value="Crime">Crime</MenuItem>
                    </Select>
                </FormControl>
            </Card>
        </>
    );
}
