import { Card, CardActionArea, CardContent, CardHeader, CardMedia, Rating, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Movie from "../types/Movie.tsx";
import CustomCard from "./Card.tsx";
import { Star } from "@mui/icons-material";

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
        <CustomCard
            additionalClasses={`h-full w-full ${watched ? "watched" : ""}`}
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
                        <div className="flex justify-between items-center">
                        <Rating
                            name="rating"
                            value={rating / 2}
                            precision={0.5}
                            readOnly
                            icon={<Star color="secondary" />}
                            emptyIcon={<Star color="disabled" />}
                            />
                            <Typography variant="body2" color="textSecondary">
                                {rating.toFixed(2)} / 10
                            </Typography>
                        </div>
                    </CardContent>
                </Link>
            </CardActionArea>
        </CustomCard>
    );
}