import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import Movie from '../types/Movie';
import VideoJS from './VideoJS';

interface MoviePresentationProps {
    movie: Movie;
    isMovieReady: boolean;
    videoID: number;
    hlsReady: boolean;
}

const MoviePresentation: React.FC<MoviePresentationProps> = ({ movie, isMovieReady, videoID, hlsReady }) => {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full">
            <Card sx={{ margin: '20px auto', padding: '16px', boxShadow: 3, overflow: 'hidden', maxWidth: '100%', width: '100%' }}>
                {isMovieReady ? (
                    <div className="w-full flex justify-center items-center" style={{ overflow: 'auto' }}>
                        <VideoJS video_ID={videoID} hlsReady={hlsReady} />
                    </div>
                ) : (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: '100%', borderRadius: '8px', maxWidth: '300px', maxHeight: '450px', margin: '0 auto' }}
                    />
                )}
                <CardContent sx={{ overflowY: 'auto' }}>
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
        </div>
    );
};

export default MoviePresentation;

