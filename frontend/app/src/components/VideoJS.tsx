import React from 'react';
import videojs from "video.js";
import VideoJS from './PlayerVideo';
import { useAuth } from '../contexts/AuthContext';



export default function Video(
props: {
    video_ID: number;
}) {

    const playerRef = React.useRef(null);
    const { getToken } = useAuth();
    const token = getToken();

    // /movies/{ movie_id } /stream/{ token }/{hls_file}
    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
            type: 'video/mp4'
            // src: `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}/movie.m3u8`, // 401 a resoudre ici et voir ce qu'est {hls_file}
            // type: 'application/x-mpegURL'
        }],
        tracks: [
          {
            kind: "subtitles",
            src: "",
            srclang: "en",
            label: "English"
          },
          {
            kind: "subtitles",
            src: "",
            srclang: "fr",
            label: "Français"
          }
        ]
    };

    const handlePlayerReady = (player: any) => {
        playerRef.current = player;
    };

    return (
        <div className="video-container w-full">
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} movieID={props.video_ID} />
        </div>
    );

}
