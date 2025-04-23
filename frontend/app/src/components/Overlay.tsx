import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation  } from "react-i18next";
import { useMovieInfo } from "../contexts/MovieInfoContext";

export interface OverlayProps {
    player: any; // Référence au player Video.js
}

const Overlay: React.FC<OverlayProps> = ({ player }) => {

    const rootRef = useRef<any>(null);
    const { t } = useTranslation();
    const { movie } = useMovieInfo();

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

        if (!movie || !player) {
            return;
        }

        movie.duration = 0; // Exemple de durée, à remplacer par la durée réelle du film (test pour voir si on peut le modifier ici)

        const overlayContent = (
            <div className="overlay-content">
                <div className="watching-label">{t("Vous regardez")}</div>
                <h2 className="movie-title">{movie.title}</h2>
                <div className="movie-info">
                    <span>{new Date(movie.release_date || "").getFullYear() || "N/A"}</span>
                    <span>• {formatDuration(movie.duration || 0)}</span>
                </div>
                <div className="casting">
                    Réalisé par {getDirector(movie.crew)}, {t("Avec")} {getTopActors(movie.casting)}
                </div>
                <div className="synopsis">{movie.overview}</div>
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
    }, [movie, player]);

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
