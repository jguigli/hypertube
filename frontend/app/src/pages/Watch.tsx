import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Video from "../components/VideoJS";
import MovieService from "../services/MovieService";
import StructureComments from "../components/StructureComments";
import { Stack } from "@mui/material";
import MoviePresentation from "../components/MoviePresentation";
import Movie from "../types/Movie";

export default function Watch() {

    const movieService = new MovieService();
    const { getToken, user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const video_ID = id || '42';

    const [movie, setMovie] = useState<Movie | null>(null);
    const [ismovieReady, setMovieReady] = useState<boolean>(false);
    const [isInvalidMovieID, setIsInvalidMovieID] = useState<boolean>(false);
    const [isTorrentNotFound, setIsTorrentNotFound] = useState<boolean>(false);

    useEffect(() => {
        async function fetchMovieInfo() {
            try {
                const response = await movieService.getMovieInfo(+video_ID, getToken(), user.language);
                if (response.success) {
                    setMovie(response.data);
                } 
            } catch (error) {
                console.error("Erreur lors du chargement du film:", error);
            }
        }
        fetchMovieInfo();
    }, [video_ID, getToken, user.language]);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
            // const response = await movieService.checkMovieDownloadStatus(video_ID, getToken());
            if (response.status === 202) {
                // Movie is ready to be watched
                setMovieReady(true);
            } else if (response.status === 200) {
                console.log("Download/Conversion in progress");
                return;
            } else if (response.status === 400) {
                console.error("Invalid movie_id");
                setIsInvalidMovieID(true);
                return;
            } else if (response.status === 404) {
                console.error("No torrent file found for this movie");
                setIsTorrentNotFound(true);
                return;
            } else {
                console.error("Unexpected error");
                return;
            }
        }
        //getDownloadMovie();
    }, [getToken, movieService])

    if (isInvalidMovieID) {
        return (
            <>
            </>
        )
    } else if (isTorrentNotFound) {
        return (
            <>
            </>
        )
    } else {
        return (
            <Stack spacing={2}>
                {ismovieReady ? (
                    <Video video_ID={+video_ID} />
                ) : (
                    <div className="flex justify-center items-center">
                        {movie && (<MoviePresentation movie={movie} />)}
                    </div>
                )}
                <StructureComments videoID={video_ID} />
            </Stack>
        );
    }
}
