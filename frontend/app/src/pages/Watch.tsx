import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Video from "../components/VideoJS";
import MovieService from "../services/MovieService";
import StructureComments from "../components/StructureComments";
import { Stack } from "@mui/material";

export default function Watch() {

    const movieService = new MovieService();
    const { getToken } = useAuth();
    const { id } = useParams<{ id: string }>();
    const videoId = id || '42';
    const [ismovieReady, setMovieReady] = useState<boolean>(false);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
            const response = await movieService.checkMovieDownloadStatus(videoId, getToken());
            if (response.status === 400) {
                // Invalid movie id
                setMovieReady(false);
            }
            else if (response.status === 200) {
                // Movie is downloading or converting, not yet available
                setMovieReady(false);
            }
            else if (response.status === 404) {
                // Movie is not available
                setMovieReady(false);
            }
            else if (response.status === 202) {
                // Movie is ready to be watched
                setMovieReady(true);
                // Set the video source
            }
        }
        getDownloadMovie();
    }, [getToken, movieService])

    return (
        <Stack spacing={2}>
            {ismovieReady ? (
                <Video video_ID={+videoId} />
            ) : (
                <div className="flex justify-center items-center">
                    <p className="text-3xl">Loading movie...</p>
                </div>
            )}

            <StructureComments videoID={videoId} />
        </Stack>
    );
}
