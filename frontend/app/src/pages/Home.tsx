import Movie from '../types/Movie.tsx'
import MovieCard from '../components/MovieCard.tsx';
import { useSearch } from '../contexts/SearchContext.tsx';
import { useState } from 'react';

export default function Home() {

    const [isFetchingMovies, setIsFetchingMovies] = useState(false);

    const { searchQuery } = useSearch();
    let movies: Movie[] = [
        { id: 1, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 2, watched: true, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 3, watched: false, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
        { id: 4, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 5, watched: false, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 6, watched: true, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
        { id: 7, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 8, watched: false, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 9, watched: true, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
        { id: 10, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 11, watched: true, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 12, watched: true, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
        { id: 13, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 14, watched: false, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 15, watched: true, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
        { id: 16, watched: true, title: 'Inception', rating: Math.random() * 10, production_year: 2010, poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg' },
        { id: 17, watched: true, title: 'The Matrix', rating: Math.random() * 10, production_year: 1999, poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png' },
        { id: 18, watched: false, title: 'Interstellar', rating: Math.random() * 10, production_year: 2014, poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg' },
    ];

    if (searchQuery) {
        movies = movies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
        movies.sort((a, b) => a.title > b.title ? 1 : -1);
    }

    // Event listener for infinite scrolling
    window.onscroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
            // Save the current scroll position
            setIsFetchingMovies(true);
            setTimeout(() => {
                const scrollPosition = window.scrollY;
                movies = movies.concat(movies);
                // Restore the scroll position
                window.scrollTo(0, scrollPosition);
                setIsFetchingMovies(false);
            }, 1000);
        }
    };

    return (
        <>
            {movies.length === 0 && <p>No movies found</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center">
                {movies.map((movie) => (
                    <MovieCard movie={movie} key={movie.id} />
                ))}
            </div>
            {isFetchingMovies && <p>Loading more movies...</p>}
        </>
    )
}
