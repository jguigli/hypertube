import React, { useEffect, useState } from 'react';
import videojs from "video.js";
import VideoJS from './test_videojs'; 
import { useMovies } from '../contexts/MovieContext';
import Movie from '../types/Movie';
import MovieService from '../services/MovieService';
import { useAuth } from '../contexts/AuthContext';


export default function Video(
props: {
    video_ID: number;
}) {

    const playerRef = React.useRef(null);
    const {getToken} = useAuth();
    const movieService = new MovieService();
    const [movieDetail, setMovieDetail] = useState<any>(undefined);
    
    useEffect(() => {
        async function getMovieInfo() {
            const response = await movieService.getMovieInfo(props.video_ID, getToken());
            if (!response.success) {
                return ;
            }
            setMovieDetail(response.data);
            console.log("Movie detail ok")
        }
        getMovieInfo();
    }, []);

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
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
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} movieDetail={movieDetail}/>
        </div>
    );

}
