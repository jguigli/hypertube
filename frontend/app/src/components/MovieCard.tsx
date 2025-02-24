import { Card, CardActionArea, CardContent, CardHeader, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import Movie from "../types/Movie.tsx";

export default function MovieCard({ movie }: { movie: Movie }) {

    const {
        id,
        watched,
        title,
        production_year,
        rating,
        poster_path,
    } = movie;

    // TODO : Differenciate watched movies from unwatched ones

    return (
        <Card
            className={`movie-card h-full w-fit ${watched ? "watched" : ""}`}
            variant="outlined"
            sx={{ borderRadius: "10px", boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)", bgcolor: "#000" }}
        >
            <CardActionArea className="h-full max-h-[600px] w-fit">
                <Link to={`/movies/${id}`}>
                    <div className="h-[400px] w-full flex items-center justify-center bg-gray-950 border-b border-b-neutral-800">
                        <CardMedia
                            component="img"
                            image={poster_path}
                            alt={title}
                            className="max-w-[300px] max-h-[400px] w-fit"
                        />
                    </div>
                    <CardHeader
                        title={title}
                        subheader={production_year}
                        variant="outlined"
                    />
                    <CardContent>
                        <p>Rating: {rating}</p>
                    </CardContent>
                </Link>
            </CardActionArea>
        </Card >
    );
}