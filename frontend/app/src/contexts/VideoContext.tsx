// import { createContext, useContext, useState } from "react";

// interface VideoContextType {
//     searchQuery: string;
// }

// const VideoContext = createContext<VideoContextType | undefined>(undefined);

// export function VideoProvider({ children }: { children: React.ReactNode }) {

//     const [searchQuery, setSearchQuery] = useState("");

//     return (
//         <VideoContext.Provider value={{ searchQuery }}>
//             {children}
//         </VideoContext.Provider>
//     );

// }

// export function useVideo() {
//     const context = useContext(VideoContext);
//     if (!context) {
//         throw new Error("useVideo must be used within a VideoProvider");
//     }
//     return context;
// }

import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import videojs from "video.js";

interface VideoContextType {
  playerRef: React.MutableRefObject<videojs.Player | null>;
  videoOptions: videojs.PlayerOptions;
  setVideoSource: (src: string, type?: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<videojs.Player | null>(null);
  const [videoOptions, setVideoOptions] = useState<videojs.PlayerOptions>({
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: "", // Source initiale vide, on la mettra à jour via `setVideoSource`
      type: "video/mp4",
    }],
  });

  // Fonction pour mettre à jour la source vidéo
  const setVideoSource = (src: string, type: string = "video/mp4") => {
    setVideoOptions((prev) => ({
      ...prev,
      sources: [{ src, type }],
    }));

    // Si le player est déjà initialisé, mettre à jour la source directement
    if (playerRef.current) {
      playerRef.current.src([{ src, type }]);
    }
  };

  return (
    <VideoContext.Provider value={{ playerRef, videoOptions, setVideoSource }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}