import {  CardActionArea, CardContent, CardHeader, CardMedia, Rating, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Movie from "../types/Movie.tsx";
import CustomCard from "./Card.tsx";
import { Star } from "@mui/icons-material";


export default function MovieCard({ movie }: { movie: Movie }) {

    // TODO : Differenciate watched movies from unwatched ones

    return (
        <CustomCard
            additionalClasses={`h-full w-full max-w-[350px] ${movie.is_watched ? "watched" : ""}`}
        >
            <CardActionArea className={`h-full w-full ${movie.is_watched && "Mui-focusVisible"}`}>
                <Link to={`/watch/${movie.id}`}>
                    <div className="h-[400px] w-full flex items-center justify-center bg-gray-950 border-b border-b-neutral-800">
                        <CardMedia
                            component="img"
                            image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ""}
                            alt={`No poster path for ${movie.title}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <CardHeader
                        title={movie.title}
                        subheader={new Date(movie.release_date).getFullYear() || "Unknown"}
                    />
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <Rating
                                name="rating"
                                value={movie.vote_average / 2}
                                precision={0.5}
                                readOnly
                                icon={<Star color="secondary" />}
                                emptyIcon={<Star color="disabled" />}
                                size="small"
                            />
                            <Typography variant="body2" color="textSecondary">
                                {movie.vote_average.toFixed(2)} / 10
                            </Typography>
                        </div>
                    </CardContent>
                </Link>
            </CardActionArea>
        </CustomCard>
    );
}