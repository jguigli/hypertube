import { useNavigate, useParams } from "react-router-dom";
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
            } else if (data === "Movie is being converted to HLS.") {
                setMovieReady(false);
            } else if (data === "Movie is downloading.") {
                setMovieReady(false);
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
            const response = await movieService.checkMovieDownloadStatus(video_ID, getToken());
            if (response.status === 202) {
                setMovieReady(false);
            } else if (response.status === 200) {
                setMovieReady(true);
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
            <Stack spacing={2}>
                {ismovieReady ? (
                    <><Video video_ID={+video_ID} />
                    {movie && (<MoviePresentation movie={movie} />)}</>
                ) : (
                    <>{movie && (<MoviePresentation movie={movie} />)}</>
                )}
                <StructureComments videoID={video_ID} />
            </Stack>
        );
    }
}
