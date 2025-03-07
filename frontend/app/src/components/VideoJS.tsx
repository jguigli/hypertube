// import { useEffect, useRef } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
// import "../styles/video.css"
// import { useVideo } from "../contexts/VideoContext";

// const VideoJS = () => {
//   const { playerRef, videoOptions } = useVideo();
//   const videoRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!playerRef.current && videoRef.current) {
//       // Création d'un élément vidéo-js
//       const videoElement = document.createElement("video-js");
//       videoElement.classList.add("vjs-big-play-centered", "video-js");
//       videoRef.current.appendChild(videoElement);

//       // Initialisation du lecteur
//       playerRef.current = videojs(videoElement, videoOptions, () => {
//         videojs.log("player is ready");
//       });
//     } else if (playerRef.current) {
//       // Met à jour la source vidéo si les options changent
//       playerRef.current.src(videoOptions.sources || []);
//     }
//   }, [videoOptions]);

//   useEffect(() => {
//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div className="video-container" data-vjs-player>
//       <div ref={videoRef} />
//     </div>
//   );
// };

// export default VideoJS;


import React from 'react';
import videojs from "video.js";
import VideoJS from './test_videojs';


export default function Video() {

    const playerRef = React.useRef(null);

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
            type: 'video/mp4'
        }],
        tracks: [
          {
            kind: "subtitles",
            src: "",
            srclang: "en",
            label: "English"
          },
          {
            kind: "subtitles",
            src: "",
            srclang: "fr",
            label: "Français"
          }
        ]
    };

    const handlePlayerReady = (player: any) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };

    return (
        <div className="video-container w-full">
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
        </div>
    );

}
