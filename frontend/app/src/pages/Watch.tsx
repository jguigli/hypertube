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
    const [isInvalidMovieID, setIsInvalidMovieID] = useState<boolean>(false);
    const [isTorrentNotFound, setIsTorrentNotFound] = useState<boolean>(false);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
            const response = await movieService.checkMovieDownloadStatus(videoId, getToken());
            if (response.status === 202) {
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
        getDownloadMovie();
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
}
