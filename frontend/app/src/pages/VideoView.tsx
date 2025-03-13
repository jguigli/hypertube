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
import { useNavigate, useParams } from "react-router-dom";
import { useMovies } from "../contexts/MovieContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Comments from "../components/Comments";
import { useNode } from "../components/Comments";
import CustomCard from "../components/Card";
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

    const videoID: string | undefined = useParams().id;
    const navigate = useNavigate();

    // Redirection vers la page d'accueil si le videoID est undefined
    if (videoID === undefined) {
        navigate("/");
        return;
    }


    // gestion du videoID undefined a faire

    // const { user } = useAuth();



    // const { movies } = useMovies();
    // const movie = movies.find((movie) => movie.imdb_id === videoID);

    // const { setVideoSource } = useVideo();

    // useEffect(() => {
    //     setVideoSource("https://vjs.zencdn.net/v/oceans.mp4");
    // }, []);

    return (
        <>
            {/* <h1>{movie?.language[user.language].title}</h1> */}

            {/* Affichage du lecteur Video.js */}
            {/* <VideoJS /> */}
            <Video video_ID={ +videoID }/>

            {/* Exemple de bouton pour changer la vidéo */}
            {/* <button onClick={() => setVideoSource("https://vjs.zencdn.net/v/oceans.mp4")}>
                Charger une nouvelle vidéo
            </button> */}
            <div className="Video_view">
            <CustomCard additionalClasses="flex flex-col align-center w-[700px] p-3">
                <Comments
                    handleInsertNode={handleInsertNode}
                    handleEditNode={handleEditNode}
                    handleDeleteNode={handleDeleteNode}
                    comments={commentsData}
                />
                </CustomCard>
            </div>
        </>
    );
}

