import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '../styles/video.css'
import { set } from 'video.js/dist/types/tech/middleware';

interface Player {
    autoplay: boolean;
    controls: boolean;
    sources: {
        src: string;
        type: string;
    }[];
}
export const VideoJS = (props: {
    options: any;
    onReady?: (player: any) => void;
}) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const { options, onReady } = props;
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayTimeout, setOverlayTimeout] = useState<any>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
            const videoElement = document.createElement("video-js");

            if (!videoRef.current) {
                return;
            }

            videoElement.classList.add('vjs-big-play-centered');

            videoRef.current.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                onReady && onReady(player);
            });


            // You could update an existing player in the `else` block here
            // on prop change, for example:
        } else {
            const player = playerRef.current;

            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        const handleUserInactivity = () => {
            if (player.hasClass('vjs-paused') && player.hasClass('vjs-user-inactive')) {
                if (!overlayTimeout) {
                    const timeout = setTimeout(() => {
                        setShowOverlay(true);
                    }, 1000); // 10 secondes d'inactivité
                    setOverlayTimeout(timeout);
                }
            }
        };

        const handleUserActivity = () => {
            if (overlayTimeout) {
                clearTimeout(overlayTimeout);
                setOverlayTimeout(null);
            }
            setShowOverlay(false); // Réinitialiser l'overlay si l'utilisateur est actif
        };

        // Détecte l'activité de l'utilisateur (sur les événements du player)
        player.on('mousemove', handleUserActivity);
        player.on('keypress', handleUserActivity);
        player.on('play', handleUserActivity);

        // Intervalle pour vérifier l'inactivité
        const interval = setInterval(handleUserInactivity, 1000);

        // Cleanup de l'intervalle et des événements à la fin
        return () => {
            clearInterval(interval);
            player.off('mousemove', handleUserActivity);
            player.off('keypress', handleUserActivity);
            player.off('play', handleUserActivity);
            if (overlayTimeout) clearTimeout(overlayTimeout);
        };
    }, [overlayTimeout]); // Ce useEffect dépend uniquement de overlayTimeout

    useEffect(() => {
        const checkFullScreen = () => {
            const isFullScreen = !!document.fullscreenElement;
            // setIsFullScreen(!!document.fullscreenElement);
            console.log("Mode plein ecran :", isFullScreen);
            setIsFullScreen(isFullScreen);
        };
        document.addEventListener("fullscreenchange", checkFullScreen);
        return () => {
            document.removeEventListener("fullscreenchange", checkFullScreen);
        };
    }, []);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player className="data-vjs-player">
            <div ref={videoRef} />
            {showOverlay && (
                <div className={`overlay ${isFullScreen ? "fullscreen-overlay" : ""}`}>
                    <div className="overlay-content">
                        <div className="watching-label"> You're watching</div>
                        <h2 className="movie-title">Nom du Film</h2>
                        <div className="movie-info">
                            <span>Year</span>
                            <span>Age</span>
                            <span>Movie time</span>
                        </div>
                        <div className="casting"> Avec Anthony Mackie, Harrison Ford, Danny Ramirez </div>
                        <div className="synopsis">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tristique, dui et facilisis commodo, tellus ante tincidunt orci, eget faucibus nunc magna ac sapien. Nullam ut mi nulla. Fusce imperdiet turpis condimentum, pretium justo id, suscipit nibh. Nunc non tortor cursus mauris.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoJS;
