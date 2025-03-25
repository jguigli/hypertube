import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, CircularProgress, Grid } from '@mui/material';
import Movie from '../types/Movie';

interface Cast {
    name: string;
    role: string;
}

interface MoviePresentationProps {
    title: string;
    releaseDate: string;
    synopsis: string;
    posterPath: string;
    casting: Cast[];
    isLoading: boolean;
}

const MoviePresentation: React.FC<MoviePresentationProps> = ({ title, releaseDate, synopsis, posterPath, casting, isLoading }) => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            {isLoading ? (
                <CircularProgress size={80} />
            ) : (
                <Card sx={{ maxWidth: 600, boxShadow: 4, borderRadius: 4, padding: 2 }}>
                    <CardMedia
                        component="img"
                        height="400"
                        image={posterPath}
                        alt={title}
                        sx={{ borderRadius: 2 }}
                    />
                    <CardContent>
                        <Typography variant="h4" component="div" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Année de sortie : {new Date(releaseDate).getFullYear()}
                        </Typography>
                        <Typography variant="body1" sx={{ marginTop: 2 }}>
                            {synopsis}
                        </Typography>
                        <Typography variant="h6" sx={{ marginTop: 3 }}>Casting :</Typography>
                        <Grid container spacing={1} sx={{ marginTop: 1 }}>
                            {casting.slice(0, 3).map((actor, index) => (
                                <Grid item xs={12} key={index}>
                                    <Typography variant="body2">
                                        {actor.name} ({actor.role})
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default MoviePresentation;
