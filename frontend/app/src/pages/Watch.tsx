import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Video from "../components/VideoJS";
import MovieService from "../services/MovieService";
import StructureComments from "../components/StructureComments";
import { Stack, Typography } from "@mui/material";
import MoviePresentation from "../components/MoviePresentation";
import { useTranslation } from 'react-i18next';
import CustomCard from "../components/Card";
import CommentType from "../types/Comments";
import { useMovieInfo } from "../contexts/MovieInfoContext";

export default function Watch() {

    const movieService = new MovieService();
    const { getToken, user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const video_ID = id || '42';

    const [ismovieReady, setMovieReady] = useState<boolean>(false);
    const [hlsReady, setHlsReady] = useState<boolean>(false);
    const [isInvalidMovieID, setIsInvalidMovieID] = useState<boolean>(false);
    const [isTorrentNotFound, setIsTorrentNotFound] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentType[]>([]);
    const { movie, setMovie } = useMovieInfo();

    const { t } = useTranslation();

    const navigate = useNavigate();


    useEffect(() => {
        const WS_URL = `ws://localhost:3000/api/ws/${user.id}`;
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            const data = event.data;
            if (data === "Movie is ready to standard streaming.") {
                setMovieReady(true);
            } else if (data === "Movie is ready to HLS streaming.") {
                setMovieReady(true);
                setHlsReady(true);
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
            if (socket.readyState === 1) {
                socket.close();
            }
        };
    }, [user]);


    useEffect(() => {
        console.log("Movie ID:", video_ID);
        console.log("User language:", user.language);
        console.log("GetTokenChanged:", getToken());
    }, [video_ID, user.language, getToken]);

    useEffect(() => {
        async function fetchMovieInfo() {
            try {
                const response = await movieService.getMovieInfo(+video_ID, getToken(), user.language);
                if (response.status === 200) {
                    setMovie(response.data);
                    setComments(response.data.comments);
                } else if (response.status === 400) {
                    setIsInvalidMovieID(true);
                }
                else if (response.status === 404) {
                    console.error("No torrent file found for this movie");
                    setIsTorrentNotFound(true);
                    return;
                }
            } catch (error) {
                console.error("Erreur lors du chargement du film:", error);
            }
        }
        fetchMovieInfo();
    }, []);

    if (isInvalidMovieID) {
        return navigate("/404", { replace: true });
    } else if (isTorrentNotFound) {
        return (
            <div className="flex justify-center items-center">
                <p className="text-3xl">{t("No torrent file found for this movie.")}</p>
            </div>
        );
    } else {
        return (
            <Stack spacing={2} className="flex flex-col items-center justify-center w-full h-full">
                {ismovieReady ? (
                    <>
                        <Typography variant="h4" className="text-white font-bold w-full">
                            {movie?.title}
                        </Typography>
                        <CustomCard additionalClasses="w-full h-full">
                            <div className="w-full h-full flex justify-center items-center max-h-[80vh]">
                                <Video video_ID={+video_ID} hlsReady={hlsReady}/>
                            </div>
                        </CustomCard>

                    </>
                ) : (
                    <>{movie && (<MoviePresentation movie={movie} />)}</>
                )}
                <StructureComments videoID={video_ID} comments={comments}/>
            </Stack>
        );
    }
}
