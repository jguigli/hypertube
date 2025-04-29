import React, { useEffect, useState, useMemo } from 'react';
import PlayerVideo from './PlayerVideo';
import { useAuth } from '../contexts/AuthContext';
import MovieService from '../services/MovieService';

export default function VideoJS(
    props: {
        video_ID: number;
        hlsReady: boolean
    }) {

    const playerRef = React.useRef(null);
    const { getToken } = useAuth();
    const token = getToken();
    const movieService = new MovieService();
    const [subtitles, setSubtitles] = useState<any[]>([]);

    useEffect(() => {
        const fetchSubtitles = async () => {

            if (!token) {
                console.log("Token is not available");
                return [];
            } else if (!props.video_ID) {
                console.log("Video ID is not available");
                return [];
            }

            const response = await movieService.getSubtitles(props.video_ID, token);
            if (!response.success) {
                console.log("Error fetching subtitles");
                return [];
            }
            console.log(response.data);
            return response.data
                .filter((subtitle: any) => subtitle.srcLang && subtitle.label) // Filtrer les éléments avec des valeurs undefined
                .map((subtitle: any) => (
                    {
                        kind: 'subtitles',
                        src: `http://localhost:3000/api/movies/stream/${props.video_ID}/${token}/subtitles/${subtitle.srcLang}`,
                        srclang: subtitle.srcLang,
                        label: subtitle.label,
                        type: 'text/vtt', // <-- Ajoute ceci
                    }
                ));
        };

        const loadSubtitles = async () => {
            const fetchedSubtitles = await fetchSubtitles();
            setSubtitles(fetchedSubtitles);
        };

        loadSubtitles();
    }, [props.video_ID]);

    const videoJsOptions = useMemo(() => ({
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: props.hlsReady
                ? `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}/master.m3u8`
                : `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}`,
            type: props.hlsReady ? 'application/x-mpegURL' : 'video/mp4'
        }],
        tracks: subtitles // Ajoute cette ligne pour passer les sous-titres à VideoJS
    }), [props.hlsReady, props.video_ID, token, subtitles]);


    const handlePlayerReady = (player: any) => {
        playerRef.current = player;
    };

    return (
        <div className="video-container w-full h-full">
            <PlayerVideo
                key={subtitles.map(s => s.src).join(',')}
                options={videoJsOptions} onReady={handlePlayerReady} />
        </div>
    );

}
