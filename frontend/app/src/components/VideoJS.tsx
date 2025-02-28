import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../styles/video.css"
import { useVideo } from "../contexts/StreamContext";

const VideoJS = () => {
  const { playerRef, videoOptions } = useVideo();
  const videoRef = useRef<HTMLDivElement | null>(null);

  const [Playing, setPlaying] = useState(false);
  const [Muted, setMuted] = useState(false);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      // Création d'un élément vidéo-js
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered", "video-js");
      videoRef.current.appendChild(videoElement);

      // Initialisation du lecteur
      playerRef.current = videojs(videoElement, videoOptions, () => {
        videojs.log("player is ready");
      });

      playerRef.current.on("play", () => setPlaying(true));
      playerRef.current.on("pause", () => setPlaying(false));

      playerRef.current.on("volumechange", () => {
        setMuted(playerRef.current?.muted() || playerRef.current?.volume() === 0);
      });

    } else if (playerRef.current) {
      // Met à jour la source vidéo si les options changent
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

  return (
    <div className="video-container" data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
