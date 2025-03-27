    // const movieService = new MovieService();
    // const { getToken, user } = useAuth();
    // const [movieDetail, setMovieDetail] = useState<Movie | null>(null);


    // //Ajout de l'ID overlay a video-js ainsi que des enfants d'overlay.
    // useEffect(() => {

    //     async function getMovieInfo() {
    //         const response = await movieService.getMovieInfo(props.movieID, getToken(), user.language);
    //         if (!response.success) {
    //             return;
    //         }
    //         setMovieDetail(response.data);
    //     }

    //     getMovieInfo();

    // }, [props.movieID, getToken]); // Add dependencies to re-run the effect when movieID or getToken changes

//     const formatDuration = (seconds: number): string => {
//         const hrs = Math.floor(seconds / 3600);
//         const mins = Math.floor((seconds % 3600) / 60);
//         const secs = Math.floor(seconds % 60);
        
//         return `${hrs}h${mins}min${secs}s`;
//     }
    
//     // Utilitaires pour formater les informations de casting et de réalisateur
// const getTopActors = (casting: any[] | undefined) => {
//     if (!casting) return "Casting non disponible";
//     const actors = casting
//         .filter((member) => member.role === "Acting")
//         .slice(0, 3) // On prend les 3 premiers acteurs
//         .map((member) => member.name)
//         .join(", ");
//     return actors || "Acteurs non disponibles";
// };

// const getDirector = (crew: any[] | undefined) => {
//     if (!crew) return "Directeur non disponible";
//     const director = crew.find((member) => member.role === "Directing");
//     return director ? director.name : "Directeur non disponible";
// };

// useEffect(() => {
//     // Ton code du useEffect ici
// }, [movieDetail, movieDuration]);


    
//     const rootRef = useRef<any>(null);
//     // Move overlay content creation and rendering to a separate useEffect
//     useEffect(() => {
//         //Contenu de l'overlay pour eviter de faire un innerHTML.

//         // if (!movieDetail) return;

//         const overlayContent = (
//             <div className="overlay-content">
//                 <div className="watching-label">You're watching</div>
//                 <h2 className="movie-title">{movieDetail?.title}</h2>
//                 <div className="movie-info">
//                     <span>{new Date(movieDetail?.release_date || "").getFullYear() || 'N/A'}</span>
//                     <span>Age</span>
//                     <span>{movieDuration ? formatDuration(movieDuration) : 'Chargement...'}</span>
//                 </div>
//                 <div className="casting">Réalisé par {getDirector(movieDetail?.crew)}, Avec {getTopActors(movieDetail?.casting)}</div>
//                 <div className="synopsis">{movieDetail?.overview}</div>
//             </div>
//         );

//         const player = playerRef.current;
//         if (!player) return;

//         const overlayElement = document.getElementById("overlay");
//         if (overlayElement) {
//             if (!rootRef.current) {
//                 rootRef.current = ReactDOM.createRoot(overlayElement);
//             }
//             rootRef.current.render(overlayContent);
//         } else {
//             const newOverlayElement = document.createElement("div");
//             newOverlayElement.id = "overlay";
//             player.el().appendChild(newOverlayElement);

//             rootRef.current = ReactDOM.createRoot(newOverlayElement);
//             rootRef.current.render(overlayContent);
//         }
//     }, [movieDetail, movieDuration]); // Add movieDetail as a dependency to re-run the effect when movieDetail changes

//     //Gestion de l'affichage de l'overlay.
//     useEffect(() => {
//         const player = playerRef.current;
//         if (!player) return;

//         let inactivityTimeout: any = null; // Pour gérer le délai d'inactivité
//         const overlayElement = document.getElementById("overlay");
//         if (!overlayElement) return;

//         // Fonction pour afficher ou cacher l'overlay selon l'état du player
//         const updateOverlayVisibility = () => {
//             // Vérifie si la vidéo est en pause et si l'utilisateur est inactif
//             if (player.hasClass("vjs-paused") && player.hasClass("vjs-user-inactive")) {
//                 if (!overlayElement.classList.contains("show")) {
//                     // Ajoute la classe "show" après 1 seconde d'inactivité
//                     inactivityTimeout = setTimeout(() => {
//                         overlayElement.classList.add("show");
//                     }, 300); // 1 seconde d'inactivité
//                 }
//             } else {
//                 clearTimeout(inactivityTimeout); // Annule le délai si l'utilisateur est actif
//                 overlayElement.classList.remove("show"); // Cache l'overlay immédiatement
//             }
//         };

//         // Les événements pour l'activité de l'utilisateur
//         const handleUserActivity = () => {
//             clearTimeout(inactivityTimeout); // Réinitialise l'inactivité
//             overlayElement.classList.remove("show"); // Cache l'overlay immédiatement
//             updateOverlayVisibility(); // Vérifie si l'overlay doit apparaître
//         };

//         const handleUserInactivity = () => {
//             updateOverlayVisibility(); // Vérifie si l'overlay doit apparaître
//         };

//         // Écoute les événements de l'utilisateur pour détecter l'activité
//         player.on("mousemove", handleUserActivity);
//         player.on("keypress", handleUserActivity);
//         player.on("play", handleUserActivity); // Quand la vidéo commence, réinitialise l'overlay
//         player.on("pause", handleUserInactivity); // Quand la vidéo est en pause, on vérifie l'inactivité

//         // Intervalle pour vérifier l'inactivité
//         const inactivityInterval = setInterval(handleUserInactivity, 300); // Vérifie l'inactivité toutes les secondes

//         // Nettoyage des événements et des intervalles lorsque le composant est démonté
//         return () => {
//             clearInterval(inactivityInterval);
//             clearTimeout(inactivityTimeout);
//             player.off("mousemove", handleUserActivity);
//             player.off("keypress", handleUserActivity);
//             player.off("play", handleUserActivity);
//             player.off("pause", handleUserInactivity);
//         };
//     }, []);


import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import MovieService from "../services/MovieService";
import { useAuth } from "../contexts/AuthContext";
import Movie from "../types/Movie";

export interface OverlayProps {
    movieID: number;
    player: any; // Référence au player Video.js
}

const Overlay: React.FC<OverlayProps> = ({ movieID, player }) => {
    const movieService = new MovieService();
    const { getToken, user } = useAuth();
    
    const [movieDetail, setMovieDetail] = useState<Movie | null>(null);
    const [movieDuration, setMovieDuration] = useState<number | undefined>(undefined);
    const rootRef = useRef<any>(null);

    // Récupérer les infos du film
    useEffect(() => {
        async function fetchMovieInfo() {
            const response = await movieService.getMovieInfo(movieID, getToken(), user.language);
            if (response.success) {
                setMovieDetail(response.data);
            }
        }
        fetchMovieInfo();
    }, [movieID, getToken]);

    // Formater la durée de la vidéo
    const formatDuration = (seconds: number): string => {
        if (!seconds) return "N/A";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins}min`;
    };

    // Récupérer les acteurs principaux
    const getTopActors = (casting: any[] | undefined) => {
        if (!casting) return "Casting non disponible";
        return casting
            .filter((member) => member.role === "Acting")
            .slice(0, 3)
            .map((member) => member.name)
            .join(", ") || "Acteurs non disponibles";
    };

    // Récupérer le réalisateur
    const getDirector = (crew: any[] | undefined) => {
        if (!crew) return "Réalisateur non disponible";
        const director = crew.find((member) => member.role === "Directing");
        return director ? director.name : "Réalisateur non disponible";
    };

    // Créer l'overlay et l'injecter dans le DOM du player
    useEffect(() => {
        if (!movieDetail || !player) return;

        const overlayContent = (
            <div className="overlay-content">
                <div className="watching-label">Vous regardez</div>
                <h2 className="movie-title">{movieDetail.title}</h2>
                <div className="movie-info">
                    <span>{new Date(movieDetail.release_date || "").getFullYear() || "N/A"}</span>
                    <span>• {formatDuration(movieDuration || 0)}</span>
                </div>
                <div className="casting">
                    Réalisé par {getDirector(movieDetail.crew)}, Avec {getTopActors(movieDetail.casting)}
                </div>
                <div className="synopsis">{movieDetail.overview}</div>
            </div>
        );

        let overlayElement = document.getElementById("overlay");
        if (!overlayElement) {
            overlayElement = document.createElement("div");
            overlayElement.id = "overlay";
            player.el().appendChild(overlayElement);
        }

        if (!rootRef.current) {
            rootRef.current = ReactDOM.createRoot(overlayElement);
        }
        rootRef.current.render(overlayContent);
    }, [movieDetail, movieDuration, player]);

    // Gérer l'affichage automatique de l'overlay
    useEffect(() => {
        if (!player) return;

        let inactivityTimeout: any = null;
        const overlayElement = document.getElementById("overlay");
        if (!overlayElement) return;

        const updateOverlayVisibility = () => {
            if (player.hasClass("vjs-paused") && player.hasClass("vjs-user-inactive")) {
                inactivityTimeout = setTimeout(() => {
                    overlayElement.classList.add("show");
                }, 300);
            } else {
                clearTimeout(inactivityTimeout);
                overlayElement.classList.remove("show");
            }
        };

        const handleUserActivity = () => {
            clearTimeout(inactivityTimeout);
            overlayElement?.classList.remove("show");
            updateOverlayVisibility();
        };

        const handleUserInactivity = () => {
            updateOverlayVisibility();
        };

        player.on("mousemove", handleUserActivity);
        player.on("keypress", handleUserActivity);
        player.on("play", handleUserActivity);
        player.on("pause", handleUserInactivity);

        const inactivityInterval = setInterval(handleUserInactivity, 300);

        return () => {
            clearInterval(inactivityInterval);
            clearTimeout(inactivityTimeout);
            player.off("mousemove", handleUserActivity);
            player.off("keypress", handleUserActivity);
            player.off("play", handleUserActivity);
            player.off("pause", handleUserInactivity);
        };
    }, [player]);

    return null;
};

export default Overlay;
