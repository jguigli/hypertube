// import React from "react";
// import VideoJS from "./VideoJS";
// import { useVideo } from "./VideoContext";


// export default function VideoView() {

//     return (
//         <>
//             <h1>Video View</h1>
//         </>
//     )
// }

import { useEffect } from "react";
import VideoJS from "../components/VideoJS";
import { useVideo } from "../contexts/VideoContext";
import { useParams } from "react-router-dom";
import { useMovies } from "../contexts/MovieContext";
import { useAuth } from "../contexts/AuthContext";

export default function VideoView() {

    const videoID = useParams().id;
    const { user } = useAuth();
    const { movies } = useMovies();
    const movie = movies.find((movie) => movie.imdb_id === videoID);
    console.log("Movie:", movie);

    const { setVideoSource } = useVideo();

    useEffect(() => {
        setVideoSource("https://vjs.zencdn.net/v/oceans.mp4");
    }, []);

    return (
        <>
            <h1>{movie?.language[user.language].title}</h1>

            {/* Affichage du lecteur Video.js */}
            <VideoJS />

            {/* Exemple de bouton pour changer la vidéo */}
            {/* <button onClick={() => setVideoSource("https://vjs.zencdn.net/v/oceans.mp4")}>
                Charger une nouvelle vidéo
            </button> */}
        </>
    );
}
