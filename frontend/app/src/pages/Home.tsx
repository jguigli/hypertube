import Movie from '../types/Movie.tsx'
import MovieCard from '../components/MovieCard.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useEffect, useState } from 'react';
import { useMovies } from '../contexts/MovieContext.tsx';


export default function Home() {

    // Maybe a MovieProvider should be created to fetch movies from the backend
    // If i use a state for the movies, the search leeds to a re-render of the whole page in an infinite loop -> KO

    const [isFetchingMovies, setIsFetchingMovies] = useState(false);
    const { movies, setMovies } = useMovies();

    const { searchQuery } = useSearch();

    function handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetchingMovies) {
            setIsFetchingMovies(true);
            const newMovies = [];
            for (let i = 0; i < 15; i++) {
                const last_id = movies[movies.length - 1].id;
                newMovies.push({
                    id: last_id + 1,
                    watched: false,
                    title: "Movie " + (last_id + 1),
                    production_year: 2025,
                    rating: 9.3,
                    poster_path: '',
                });
            }
            setMovies([...movies, ...newMovies]);
            setIsFetchingMovies(false);
        }
    }

    useEffect(() => {
        window.onscroll = () => {
            handleScroll();
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [movies]);


    let filteredMovies = movies;

    if (searchQuery) {
        filteredMovies = filteredMovies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
        filteredMovies.sort((a, b) => a.title > b.title ? 1 : -1);

        if (filteredMovies.length === 0) {
            return (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            )
        }
        else {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center p-4">
                    {filteredMovies.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div >
            )
        }
    }

    // Infinite scroll

    // const [page, setPage] = useState(1);
    // const [hasMore, setHasMore] = useState(true);

    // useEffect(() => {
    //     const fetchMovies = async () => {
    //         setIsFetchingMovies(true);
    //         // const response = await fetch(`http://localhost:3001/movies?page=${page}`);
    //         // const data = await response.json();
    //         // if (data.length === 0) {
    //         //     setHasMore(false);
    //         // } else {
    //         //     addMovie(data);
    //         //     setPage(page + 1);
    //         // }
    //         setIsFetchingMovies(false);
    //     }

    //     fetchMovies();
    // }, [page]);

    return (
        <>
            {movies.length === 0 ? (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">No movies found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center p-4">
                    {movies.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div >
            )
            }
        </>
    )
}
