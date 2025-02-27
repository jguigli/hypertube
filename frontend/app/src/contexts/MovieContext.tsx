import { createContext, useContext, useState } from "react";
import Movie from "../types/Movie";

interface MoviesContextType {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

export function MoviesProvider({ children }: { children: React.ReactNode }) {

    const [movies, setMovies] = useState<Movie[]>([
        {
            imdb_id: "1",
            watched: true,
            language: {
                en: {
                    title: 'Inception',
                    poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg',
                    audio: ""
                },
                fr: {
                    title: 'Inception',
                    poster_path: 'https://lioneldavoust.com/wp-content/uploads/inception.jpg',
                    audio: ""
                }
            },
            imdb_rating: Math.random() * 10,
            production_year: 2010,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Sci-Fi', 'Thriller'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        },
        {
            imdb_id: "2",
            watched: true,
            language: {
                en: {
                    title: 'The Matrix',
                    poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png',
                    audio: ""
                },
                fr: {
                    title: 'Matrix',
                    poster_path: 'https://media.senscritique.com/media/000021915685/0/matrix.png',
                    audio: ""
                }
            },
            imdb_rating: Math.random() * 10,
            production_year: 1999,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Sci-Fi', 'Action'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        },
        {
            imdb_id: "3",
            watched: false,
            language: {
                en: {
                    title: 'Interstellar',
                    poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg',
                    audio: ""
                },
                fr: {
                    title: 'Interstellar',
                    poster_path: 'https://bibliosff.wordpress.com/wp-content/uploads/2022/07/interstellar-affiche-film.jpg',
                    audio: ""
                }
            },
            imdb_rating: Math.random() * 10,
            production_year: 2014,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Sci-Fi', 'Drama'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        },
        {
            imdb_id: "4",
            watched: false,
            language: {
                en: {
                    title: 'Enter the Void',
                    poster_path: 'https://m.media-amazon.com/images/M/MV5BMjEzNzMzNzQzNl5BMl5BanBnXkFtZTcwNjExMTE3Mw@@._V1_.jpg',
                    audio: ""
                },
                fr: {
                    title: 'Enter the Void',
                    poster_path: 'https://m.media-amazon.com/images/M/MV5BMjEzNzMzNzQzNl5BMl5BanBnXkFtZTcwNjExMTE3Mw@@._V1_.jpg',
                    audio: ""
                }
            },
            imdb_rating: Math.random() * 10,
            production_year: 2009,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Drama'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        },
        {
            imdb_id: "5",
            watched: true,
            language: {
                en: {
                    title: 'The Godfather',
                    poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                    audio: ""
                },
                fr: {
                    title: 'Le Parrain',
                    poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
                    audio: ""
                }
            },
            imdb_rating: 9.2,
            production_year: 1972,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Crime', 'Drama'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        },
        {
            imdb_id: "6",
            watched: false,
            language: {
                en: {
                    title: 'The Dark Knight',
                    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                    audio: ""
                },
                fr: {
                    title: 'Le Chevalier Noir',
                    poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
                    audio: ""
                }
            },
            imdb_rating: 9.0,
            production_year: 2008,
            videos_quality: {
                sd_url: '',
                hd_url: '',
                full_hd_url: ''
            },
            nb_downloads: 0,
            nb_peers: 0,
            nb_seeders: 0,
            genres: ['Action', 'Crime'],
            summary: '',
            casting: {
                producer: '',
                director: '',
                actors: []
            }
        }
    ]);

    return (
        <MoviesContext.Provider value={{ movies, setMovies }}>
            {children}
        </MoviesContext.Provider>
    );
}

export function useMovies() {
    const context = useContext(MoviesContext);
    if (!context) {
        throw new Error("useMovies must be used within a MoviesProvider");
    }
    return context;
}