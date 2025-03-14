import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import ReactDOM from "react-dom/client"
import 'video.js/dist/video-js.css';
import '../styles/video.css'
import MovieService from '../services/MovieService';
import { useAuth } from '../contexts/AuthContext';
import Movie from '../types/Movie';

// interface Player {
//     autoplay: boolean;
//     controls: boolean;
//     sources: {
//         src: string;
//         type: string;
//     }[];
// }
export const VideoJS = (props: {
    options: any;
    movieID: number;
    onReady?: (player: any) => void;
}) => {

    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const { options, onReady } = props;
    const [movieDuration, setmovieDuration] = useState<number | undefined>(undefined);

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

            player.on("loadedmetadata", () => {
                const duration = player.duration();
                console.log("Duree de la video: ", duration, "secondes");
                setmovieDuration(duration);
            });
            // You could update an existing player in the `else` block here
            // on prop change, for example:
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    const movieService = new MovieService();
    const { getToken } = useAuth();
    const [movieDetail, setMovieDetail] = useState<Movie | null>(null);


    //Ajout de l'ID overlay a video-js ainsi que des enfants d'overlay.
    useEffect(() => {

        async function getMovieInfo() {
            const response = await movieService.getMovieInfo(props.movieID, getToken());
            if (!response.success) {
                return;
            }
            setMovieDetail(response.data);
        }

        getMovieInfo();

    }, [props.movieID, getToken]); // Add dependencies to re-run the effect when movieID or getToken changes

    const rootRef = useRef<any>(null);

    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${hrs}h${mins}min${secs}s`;
    }


    // Move overlay content creation and rendering to a separate useEffect
    useEffect(() => {
        //Contenu de l'overlay pour eviter de faire un innerHTML.

        // if (!movieDetail) return;

        const overlayContent = (
            <div className="overlay-content">
                <div className="watching-label">You're watching</div>
                <h2 className="movie-title">{movieDetail?.title}</h2>
                <div className="movie-info">
                    <span>{new Date(movieDetail?.release_date || "").getFullYear() || 'N/A'}</span>
                    <span>Age</span>
                    <span>{movieDuration ? formatDuration(movieDuration) : 'Chargement...'}</span>
                </div>
                <div className="casting">Avec Anthony Mackie, Harrison Ford, Danny Ramirez</div>
                <div className="synopsis">{movieDetail?.overview}</div>
            </div>
        );

        const player = playerRef.current;
        if (!player) return;

        const overlayElement = document.getElementById("overlay");
        if (overlayElement) {
            if (!rootRef.current) {
                rootRef.current = ReactDOM.createRoot(overlayElement);
            }
            rootRef.current.render(overlayContent);
        } else {
            const newOverlayElement = document.createElement("div");
            newOverlayElement.id = "overlay";
            player.el().appendChild(newOverlayElement);

            rootRef.current = ReactDOM.createRoot(newOverlayElement);
            rootRef.current.render(overlayContent);
        }
    }, [movieDetail, movieDuration]); // Add movieDetail as a dependency to re-run the effect when movieDetail changes

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
                    }, 300); // 1 seconde d'inactivité
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
        const inactivityInterval = setInterval(handleUserInactivity, 300); // Vérifie l'inactivité toutes les secondes

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