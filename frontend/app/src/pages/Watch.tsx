import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Video from "../components/VideoJS";
import MovieService from "../services/MovieService";
import StructureComments from "../components/StructureComments";

export default function Watch() {
    
    const movieService = new MovieService();
    const { getToken } = useAuth();
    const { id } = useParams<{ id: string }>();
    const videoId = id || '42';
    const [ismovieReady, setMovieReady] = useState<boolean>(false);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
        // const response = await movieService.checkMovieDownloadStatus(safeID, getToken());
        console.log("Appelle de la fonction download.")
    }
    getDownloadMovie();
    }, [getToken, movieService])

    return (
        <>
            <Video video_ID={+videoId} />
            <StructureComments videoID={videoId} />
        </>
    );
}
