// import { useEffect, useRef, useState } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
// import "../styles/video.css"
// import { useVideo } from "../contexts/StreamContext";

// const VideoJS = () => {
//   const { playerRef, videoOptions } = useVideo();
//   const videoRef = useRef<HTMLDivElement | null>(null);

//   const [playing, setPlaying] = useState(false);
//   const [muted, setMuted] = useState(false);

//   useEffect(() => {
//     if (!playerRef.current && videoRef.current) {
//       // Création d'un élément vidéo-js
//       const videoElement = document.createElement("video-js");
//       videoElement.classList.add("vjs-big-play-centered", "video-js");
//       videoRef.current.appendChild(videoElement);

//       // Initialisation du lecteur
//       playerRef.current = videojs(videoElement, videoOptions, () => {
//         videojs.log("player is ready");

//       // Une fois le lecteur prêt, on peut retirer la classe "vjs-control-enabled"
//       if (playerRef.current) {
//         const playerElement = playerRef.current.el(); // Récupérer l'élément DOM du lecteur
//         if (playerElement.classList.contains('vjs-controls-enabled')) {
//           playerElement.classList.remove('vjs-controls-enableds'); // Retirer la classe si présente
//           console.log('La classe "vjs-controls-enabled" a été retirée');
//         }
//       }

//       setPlaying(playerRef.current?.paused() === false);
//       setMuted(playerRef.current?.muted() || playerRef.current?.volume() === 0);
//       });


//       playerRef.current.on("play", () => setPlaying(true));
//       playerRef.current.on("pause", () => setPlaying(false));
//       playerRef.current.on("volumechange", () => {
//         setMuted(playerRef.current?.muted() || playerRef.current?.volume() === 0);
//       });

//     } else if (playerRef.current) {
//       // Met à jour la source vidéo si les options changent
//         playerRef.current.src(videoOptions.sources || []);
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

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../styles/video.css"
import { useVideo } from "../contexts/StreamContext";

const VideoJS = () => {
  const { playerRef, videoOptions } = useVideo();
  const videoRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      // Création de l'élément vidéo-js
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered", "video-js");
      videoRef.current.appendChild(videoElement);

      // Initialisation du lecteur Video.js
      playerRef.current = videojs(videoElement, videoOptions, () => {
        videojs.log("Player is ready");

        setPlaying(playerRef.current?.paused() === false);
        setMuted(playerRef.current?.muted() || playerRef.current?.volume() === 0);

        // Vérifier les classes pour déterminer l'état initial
        updatePlayingState();
      });

      // Observer les changements de classes sur l'élément vidéo
      const observer = new MutationObserver(updatePlayingState);
      observer.observe(videoRef.current, { attributes: true, attributeFilter: ['class'] });

      return () => observer.disconnect();
    } else if (playerRef.current) {
      // Mise à jour de la source vidéo si les options changent
      playerRef.current.src(videoOptions.sources || []);
    }
  }, [videoOptions]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Fonction qui met à jour l'état "playing" en fonction des classes CSS
  const updatePlayingState = () => {
    if (playerRef.current) {
      const playerElement = playerRef.current.el();
      if (playerElement.classList.contains('vjs-playing')) {
        setPlaying(true);
      } else if (playerElement.classList.contains('vjs-paused')) {
        setPlaying(false);
      }
    }
  };

  return (
    <div className="video-container" data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;