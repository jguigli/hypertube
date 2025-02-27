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
import VideoJS from "../components/VideoJS";  // Chemin ajusté pour `components/`
import { useVideo } from "../contexts/VideoContext";  // Chemin ajusté pour `context/`
import { useParams } from "react-router-dom";

export default function VideoView() {

    // const videoID = useParams().videoID;
    //

    const { setVideoSource } = useVideo();

    // React useEffect pour charger la vidéo au chargement de la page
    useEffect(() => {
        setVideoSource("https://vjs.zencdn.net/v/oceans.mp4");
    }, []);

    return (
        <>
            <h1>Video View</h1>

            {/* Affichage du lecteur Video.js */}
            <VideoJS />

            {/* Exemple de bouton pour changer la vidéo */}
            {/* <button onClick={() => setVideoSource("https://vjs.zencdn.net/v/oceans.mp4")}>
                Charger une nouvelle vidéo
            </button> */}
        </>
    );
}
