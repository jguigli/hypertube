import React, { useState } from 'react';
// import videojs from "video.js";
import VideoJS from './PlayerVideo';
import { useAuth } from '../contexts/AuthContext';



export default function Video(
props: {
    video_ID: number;
    hlsReady: boolean
}) {

    const playerRef = React.useRef(null);
    const { getToken } = useAuth();
    const token = getToken();

    const [videoResolution, setVideoResolution] = useState("master")

    const hls_file = `${videoResolution}.m3u8`

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            // src: 'https://vjs.zencdn.net/v/oceans.mp4',
            // type: 'video/mp4'
            src: props.hlsReady ? `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}/${hls_file}` : `http://localhost:3000/api/movies/${props.video_ID}/stream/${token}`,
            type: props.hlsReady ? 'application/x-mpegURL' : 'video/mp4'
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
        <div className="video-container w-full h-full">
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} movieID={props.video_ID} />
        </div>
    );

}
