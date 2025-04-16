import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '../styles/video.css'
import Overlay from "./Overlay"


export const VideoJS = (props: {
    options: any;
    movieID: number;
    onReady?: (player: any) => void;
}) => {

    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const { options, onReady } = props;

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
            <Overlay movieID={props.movieID} player={playerRef.current} />
        </div>
    );
}

export default VideoJS;