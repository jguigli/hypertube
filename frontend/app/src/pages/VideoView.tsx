// import React from "react";
// import VideoJS from "./VideoJS";
// import { useVideo } from "./VideoContext";


// export default function VideoView() {

//     return (
//         <>
//             <h1>Video View</h1>
//         </>
//     )
// }

// import React, { useEffect } from "react";
// import VideoJS from "../components/VideoJS";
// import { useVideo } from "../contexts/VideoContext";
import { useParams } from "react-router-dom";
import { useMovies } from "../contexts/MovieContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Comments from "../components/Comments";
import { useNode } from "../components/Comments";
import Video from "../components/VideoJS";

interface CommentType {
    id: number;
    name?: string;
    items: CommentType[];
}

const initialComments: CommentType = {
    id: 1,
    items: []
};

export default function VideoView() {
    const [commentsData, setCommentsData] = useState<CommentType>(initialComments);

    const { insertNode, editNode, deleteNode } = useNode();

    const handleInsertNode = (commentId: number, value: string): void => {
        if (!value.trim()) return;
        const finalStructure = insertNode(commentsData, commentId, value);
        setCommentsData(finalStructure);
    };

    const handleEditNode = (commentId: number, value: string): void => {
        if (!value.trim()) return;
        const finalStructure = editNode(commentsData, commentId, value);
        setCommentsData(finalStructure);
    };

    const handleDeleteNode = (commentId: number): void => {
        const finalStructure = deleteNode(commentsData, commentId);
        setCommentsData(finalStructure ?? commentsData);
    };

    const videoID = useParams().id;
    const { user } = useAuth();
    const { movies } = useMovies();
    const movie = movies.find((movie) => movie.imdb_id === videoID);

    // const { setVideoSource } = useVideo();

    // useEffect(() => {
    //     setVideoSource("https://vjs.zencdn.net/v/oceans.mp4");
    // }, []);

    return (
        <>
            <h1>{movie?.language[user.language].title}</h1>

            {/* Affichage du lecteur Video.js */}
            <Video />

            {/* Exemple de bouton pour changer la vidéo */}
            {/* <button onClick={() => setVideoSource("https://vjs.zencdn.net/v/oceans.mp4")}>
                Charger une nouvelle vidéo
            </button> */}
            <h1>Video View</h1>
            <div className="Video_view">
                <Comments
                    handleInsertNode={handleInsertNode}
                    handleEditNode={handleEditNode}
                    handleDeleteNode={handleDeleteNode}
                    comments={commentsData}
                />
            </div>
        </>
    );
}

