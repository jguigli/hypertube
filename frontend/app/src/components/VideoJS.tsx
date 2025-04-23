import React, { useEffect, useState } from 'react';
// import videojs from "video.js";
import VideoJS from './PlayerVideo';
import { useAuth } from '../contexts/AuthContext';
import MovieService from '../services/MovieService';



export default function Video(
    props: {
        video_ID: number;
        hlsReady: boolean
    }) {

    const playerRef = React.useRef(null);
    const { getToken } = useAuth();
    const token = getToken();
    const movieService = new MovieService();
    const [subtitles, setSubtitles] = useState([]);


    useEffect(() => {
        const fetchSubtitles = async () => {
            const response = await movieService.getSubtitles(props.video_ID, token);
            if (!response.success) {
                console.log("Error fetching subtitles");
                return [];
            }
            console.log(response.data);
            const subtitles = response.data.map((subtitle: any) => ({
                src: `http://localhost:3000/api/movies/${props.video_ID}/subtitles?lang=${subtitle.lang}`,
                srclang: subtitle.lang,
                label: subtitle.lang
            }));
            return subtitles;
        };

        const loadSubtitles = async () => {
            // 1 - Fetch des sous titres dans le backend -> Nous retrourne la liste des sous titres disponnibles
            const fetchedSubtitles = await fetchSubtitles();
            // 2- Mise a jour de la liste des sous titres
            setSubtitles(fetchedSubtitles);
        };

        loadSubtitles();
    }, [props.video_ID]);

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: props.hlsReady ? `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}/master.m3u8` : `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}`,
            type: props.hlsReady ? 'application/x-mpegURL' : 'video/mp4'
        }],
        tracks: subtitles,
    };

    const handlePlayerReady = (player: any) => {
        playerRef.current = player;
    };

    return (
        <div className="video-container w-full h-full">
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} movieID={props.video_ID} />
        </div>
    );

}
