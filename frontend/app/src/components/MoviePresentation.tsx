import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import Movie from '../types/Movie';

interface MoviePresentationProps {
    movie: Movie;

}

const MoviePresentation: React.FC<MoviePresentationProps> = ({ movie }) => {
  return (
    <Card sx={{ maxWidth: 345, margin: '20px auto', padding: '16px', boxShadow: 3 }}>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ width: '100%', borderRadius: '8px' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {movie.title} ({new Date(movie.release_date).getFullYear()})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {movie.overview}
        </Typography>
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {movie.casting?.map((actor) => (
            <Chip key={actor.name} label={actor.name} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoviePresentation;

