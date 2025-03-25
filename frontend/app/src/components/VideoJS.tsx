import React from 'react';
import videojs from "video.js";
import VideoJS from './test_videojs';



export default function Video(
props: {
    video_ID: number;
}) {

    const playerRef = React.useRef(null);

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: `http://localhost:3000/api/movies/${props.video_ID}/stream`,
            type: 'video/mp4'
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

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };

    return (
        <div className="video-container w-full">
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} movieID={props.video_ID}/>
        </div>
    );

}
