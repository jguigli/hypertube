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
    const overlayRef = useRef<HTMLDivElement>(null);
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

    //Ajout de l'ID overlay a video-js ainsi que des enfants d'overlay.
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        if (!document.getElementById("overlay")) {
            const overlayElement = document.createElement("div");
            overlayElement.id = "overlay";
            overlayElement.innerHTML = `
                <div class="overlay-content">
                    <div class="watching-label"> You're watching</div>
                    <h2 class="movie-title">Nom du Film</h2>
                    <div class="movie-info">
                        <span>Year</span>
                        <span>Age</span>
                        <span>Movie time</span>
                    </div>
                    <div class="casting"> Avec Anthony Mackie, Harrison Ford, Danny Ramirez </div>
                    <div class="synopsis">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tristique, dui et facilisis commodo, tellus ante tincidunt orci, eget faucibus nunc magna ac sapien. Nullam ut mi nulla. Fusce imperdiet turpis condimentum, pretium justo id, suscipit nibh. Nunc non tortor cursus mauris.</div>
                </div>
            `;

            player.el().appendChild(overlayElement);
        }
    }, []);

    //Gestion de l'affichage de l'overlay.
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;
    
        let inactivityTimeout: any = null; // Pour gérer le délai d'inactivité
        const overlayElement = document.getElementById("overlay");
        if (!overlayElement) return;
    
        // Fonction pour afficher ou cacher l'overlay selon l'état du player
        const updateOverlayVisibility = () => {
            // Vérifie si la vidéo est en pause et si l'utilisateur est inactif
            if (player.hasClass("vjs-paused") && player.hasClass("vjs-user-inactive")) {
                if (!overlayElement.classList.contains("show")) {
                    // Ajoute la classe "show" après 1 seconde d'inactivité
                    inactivityTimeout = setTimeout(() => {
                        overlayElement.classList.add("show");
                    }, 1000); // 1 seconde d'inactivité
                }
            } else {
                clearTimeout(inactivityTimeout); // Annule le délai si l'utilisateur est actif
                overlayElement.classList.remove("show"); // Cache l'overlay immédiatement
            }
        };
    
        // Les événements pour l'activité de l'utilisateur
        const handleUserActivity = () => {
            clearTimeout(inactivityTimeout); // Réinitialise l'inactivité
            overlayElement.classList.remove("show"); // Cache l'overlay immédiatement
            updateOverlayVisibility(); // Vérifie si l'overlay doit apparaître
        };
    
        const handleUserInactivity = () => {
            updateOverlayVisibility(); // Vérifie si l'overlay doit apparaître
        };
    
        // Écoute les événements de l'utilisateur pour détecter l'activité
        player.on("mousemove", handleUserActivity);
        player.on("keypress", handleUserActivity);
        player.on("play", handleUserActivity); // Quand la vidéo commence, réinitialise l'overlay
        player.on("pause", handleUserInactivity); // Quand la vidéo est en pause, on vérifie l'inactivité
    
        // Intervalle pour vérifier l'inactivité
        const inactivityInterval = setInterval(handleUserInactivity, 1000); // Vérifie l'inactivité toutes les secondes
    
        // Nettoyage des événements et des intervalles lorsque le composant est démonté
        return () => {
            clearInterval(inactivityInterval);
            clearTimeout(inactivityTimeout);
            player.off("mousemove", handleUserActivity);
            player.off("keypress", handleUserActivity);
            player.off("play", handleUserActivity);
            player.off("pause", handleUserInactivity);
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
        </div>
    );
}

export default VideoJS;
