import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import MovieService from "../services/MovieService";
import { useAuth } from "../contexts/AuthContext";
import Movie from "../types/Movie";
import { useTranslation  } from "react-i18next";

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
    const { t } = useTranslation();

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
        if (!casting) return t("Acteurs non disponible");
        return casting
            .filter((member) => member.role === "Acting")
            .slice(0, 3)
            .map((member) => member.name)
            .join(", ") || t("Acteurs non disponibles");
    };

    // Récupérer le réalisateur
    const getDirector = (crew: any[] | undefined) => {
        if (!crew) return "Réalisateur non disponible";
        const director = crew.find((member) => member.role === "Directing");
        return director ? director.name : t("Réalisateur non disponible");
    };

    // Créer l'overlay et l'injecter dans le DOM du player
    useEffect(() => {
        if (!movieDetail || !player) return;

        const overlayContent = (
            <div className="overlay-content">
                <div className="watching-label">{t("Vous regardez")}</div>
                <h2 className="movie-title">{movieDetail.title}</h2>
                <div className="movie-info">
                    <span>{new Date(movieDetail.release_date || "").getFullYear() || "N/A"}</span>
                    <span>• {formatDuration(movieDuration || 0)}</span>
                </div>
                <div className="casting">
                    Réalisé par {getDirector(movieDetail.crew)}, {t("Avec")} {getTopActors(movieDetail.casting)}
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
