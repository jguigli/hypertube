import {  CardActionArea, CardContent, CardHeader, CardMedia, Rating, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Movie from "../types/Movie.tsx";
import CustomCard from "./Card.tsx";
import { Star } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext.tsx";


export default function MovieCard({ movie }: { movie: Movie }) {

    // TODO : Differenciate watched movies from unwatched ones
    const {user} = useAuth();

    return (
        <CustomCard
            additionalClasses={`h-full w-full ${movie.watched ? "watched" : ""}`}
        >
            <CardActionArea className="h-full max-h-[600px] w-fit">
                <Link to={`/watch/${movie.imdb_id}`}>
                    <div className="h-[400px] w-full flex items-center justify-center bg-gray-950 border-b border-b-neutral-800">
                        <CardMedia
                            component="img"
                            image={movie.language[user.language].poster_path}
                            alt={movie.language[user.language].title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <CardHeader
                        title={movie.language[user.language].title}
                        subheader={movie.production_year}
                        variant="outlined"
                    />
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <Rating
                                name="rating"
                                value={movie.imdb_rating / 2}
                                precision={0.5}
                                readOnly
                                icon={<Star color="secondary" />}
                                emptyIcon={<Star color="disabled" />}
                                size="small"
                            />
                            <Typography variant="body2" color="textSecondary">
                                {movie.imdb_rating.toFixed(2)} / 10
                            </Typography>
                        </div>
                    </CardContent>
                </Link>
            </CardActionArea>
        </CustomCard>
    );
}