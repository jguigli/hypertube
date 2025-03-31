import { useNavigate, useParams } from "react-router-dom";
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

    const [isReady, setIsReady] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isConverting, setIsConverting] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        const WS_URL = `ws://localhost:3000/api/ws/1`; // Replace '1' with the actual user ID if needed
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            const data = event.data;

            if (data === "Movie is ready.") {
                setMovieReady(true);
                setIsConverting(false);
                setIsDownloading(false);
                setIsReady(true);
            } else if (data === "Movie is being converted to HLS.") {
                console.log("Movie is being converted to HLS.");
                setMovieReady(false);
                setIsConverting(true);
                setIsDownloading(false);
            } else if (data === "Movie is downloading.") {
                console.log("Movie is downloading.");
                setIsDownloading(true);
                setMovieReady(false);
                setIsConverting(false);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Cleanup on component unmount
        return () => {
            socket.close();
        };
    }, []);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
            const response = await movieService.checkMovieDownloadStatus(videoId, getToken());
            if (response.status === 202) {
                // Movie is ready to be watched
                setMovieReady(true);
            } else if (response.status === 200) {
                console.log("Download/Conversion in progress");
                return;
            } else if (response.status === 400 || response.status === 422) {
                setIsInvalidMovieID(true);
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
        return navigate("/404", { replace: true });
    } else if (isTorrentNotFound) {
        return (
            <div className="flex justify-center items-center">
                <p className="text-3xl">No torrent file found for this movie.</p>
            </div>
        );
    } else {
        return (
            <Stack spacing={2} className="w-full h-[80vh]">
                {ismovieReady ? (
                    <Video video_ID={+videoId} />
                ) : (
                    <div className="flex justify-center items-center">
                        <p className="text-3xl">Loading movie...</p>
                    </div>
                )}

                {/* Debug : display the status of the movie */}
                <Stack direction={"column"} className="text-center">
                    <p>
                        {isReady ? "Movie is ready" : "Movie is not ready"}
                    </p>
                    <p>
                        {isDownloading ? "Movie is downloading" : "Movie is not downloading"}
                    </p>
                    <p>
                        {isConverting ? "Movie is being converted" : "Movie is not being converted"}
                    </p>
                </Stack>

                <StructureComments videoID={videoId} />
            </Stack>
        );
    }
}
