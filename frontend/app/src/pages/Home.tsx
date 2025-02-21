class Movie {

    title: string;
    thumbnail: string;
    description: string;
    year: number;
    director: string;
    actors: string[];
    genres: string[];
    rating: number;

    constructor(title: string, thumbnail: string, description: string, year: number, director: string, actors: string[], genres: string[], rating: number) {
        this.title = title;
        this.thumbnail = thumbnail;
        this.description = description;
        this.year = year;
        this.director = director;
        this.actors = actors;
        this.genres = genres;
        this.rating = rating;
    }
}



export default function Home() {

    const movies: Movie[] = [
        // new Movie(
        //     "The Shawshank Redemption",
        //     "https://images-na.ssl-images-amazon.com/images/I/51S9gFm2aHL._AC_.jpg",
        //     "Two imprisoned ...",
        //     1994,
        //     "Frank Darabont",
        //     ["Tim Robbins", "Morgan Freeman"],
        //     ["Drama"],
        //     9.3
        // ),
        // new Movie(
        //     "The Godfather",
        //     "https://images-na.ssl-images-amazon.com/images/I/51v5ZpFyaFL._AC_.jpg",
        //     "The aging patriarch ...",
        //     1972,
        //     "Francis Ford Coppola",
        //     ["Marlon Brando", "Al Pacino"],
        //     ["Crime", "Drama"],
        //     9.2
        // ),
        // new Movie(
        //     "The Dark Knight",
        //     "https://images-na.ssl-images-amazon.com/images/I/51kGZ4CCjFL._AC_.jpg",
        //     "When the menace ...",
        //     2008,
        //     "Christopher Nolan",
        //     ["Christian Bale", "Heath Ledger"],
        //     ["Action", "Crime", "Drama"],
        //     9.0
        // ),

    ];


    return (
        <>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movies.map((movie, index) => (
                    <div key={index} className="flex flex-col gap-2 w-full">
                        <img src={movie.thumbnail} alt={movie.title} className="w-full h-96 object-cover" />
                        <h2 className="text-xl">{movie.title}</h2>
                        <p>{movie.description}</p>
                        <p>Year: {movie.year}</p>
                        <p>Director: {movie.director}</p>
                        <p>Actors: {movie.actors.join(", ")}</p>
                        <p>Genres: {movie.genres.join(", ")}</p>
                        <p>Rating: {movie.rating}</p>
                    </div>
                ))}
            </div>
        </>
    )
}
