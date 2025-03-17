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
import { useEffect, useState } from "react";
import Comments from "../components/Comments";
import { useNode } from "../components/Comments";
import CustomCard from "../components/Card";
import Video from "../components/VideoJS";
import MovieService from "../services/MovieService";
import CommentService from "../services/CommentService";
import { Button } from "@mui/material";

export interface CommentType {
    id: number;
    user_id: number;
    user_name: string;
    content: string;
    timestamp?: number;
    // name?: string;
    // video_id: number
    // avatarUrl?: string;
    items?: CommentType[];
}


// const initialComments: CommentType = {
//     id: 1,
//     user_id: 1,
//     user_name: "user",
//     content: "content",
//     items: [],
//     timestamp: Date.now(),
// };

export default function VideoView() {

    const [commentsData, setCommentsData] = useState<CommentType[]>([]);

    const { insertNode, editNode, deleteNode } = useNode();

    const handleInsertNode = (commentId: number, value: string): void => {
        if (!value.trim() || !videoID) return;
        const rootComment = commentsData.length > 0 ? commentsData[0] : null;
        if (!rootComment) return;

        const finalStructure = insertNode(rootComment, commentId, value, +videoID);
        setCommentsData(Array.isArray(finalStructure) ? finalStructure : [finalStructure]);
    };

    const handleEditNode = (commentId: number, value: string): void => {
        if (!value.trim() || !videoID) return;
        const rootComment = commentsData.length > 0 ? commentsData[0] : null;
        if (!rootComment) return;

        const finalStructure = editNode(rootComment, commentId, value, +videoID);
        setCommentsData(Array.isArray(finalStructure) ? finalStructure : [finalStructure]);
    };

    const handleDeleteNode = (commentId: number): void => {
        const rootComment = commentsData.length > 0 ? commentsData[0] : null;
        if (!rootComment) return;

        const finalStructure = deleteNode(rootComment, commentId);
        setCommentsData(finalStructure ? (Array.isArray(finalStructure) ? finalStructure : [finalStructure]) : commentsData);
    };

    const { id } = useParams<{ id: string }>();
    const videoID = id ? parseInt(id, 10) : null;
    const navigate = useNavigate();

    const { getToken, user } = useAuth();

    // const buildCommentTree = (comments: CommentType[]): CommentType[] => {
    //     const commentMap: { [key: number]: CommentType } = {};
    //     let rootComment: CommentType = {
    //         id: 1,
    //         user_id: 1,
    //         user_name: "user",
    //         // video_id: 0,
    //         content: "Root comment",
    //         timestamp: Date.now(),
    //         items: [],
    //     };

    //     comments.forEach(comment => {
    //         comment.items = [];
    //         commentMap[comment.id] = comment;

    //         if (comment.id === 1) {
    //             rootComment = comment;
    //         }
    //     });

    //     comments.forEach(comment => {
    //         if (comment.user_id && commentMap[comment.user_id]) {
    //             commentMap[comment.user_id].items?.push(comment);
    //         }
    //     });

    //     return rootComment;
    // };

    useEffect(() => {

        async function getMovieInfo() {
            const movieService = new MovieService();

            if (!videoID) {
                navigate("/");
                return;
            }
            const response = await movieService.getMovieInfo(+videoID, getToken());
            if (!response.success) {
                console.error("Failed to fetch comments", response);
                return;
            }
            console.log("Fetched comments:", response.data.comments);
        
            setCommentsData(response.data.comments);

            const maxId = response.data.comments.length > 0 
            ? Math.max(...response.data.comments.map((comment: CommentType) => comment.id)) 
            : 0;

            setCommentId(maxId + 1);

            // setCommentsData((prev) => [...prev, response.data.comments]);
            // setCommentsData([response.data.comments]);;
        }

        getMovieInfo();

    }, [getToken, navigate, videoID])

    // Redirection vers la page d'accueil si le videoID est undefined


    // gestion du videoID undefined a faire

    // const { user } = useAuth();



    // const { movies } = useMovies();
    // const movie = movies.find((movie) => movie.imdb_id === videoID);

    // const { setVideoSource } = useVideo();

    // useEffect(() => {
    //     setVideoSource("https://vjs.zencdn.net/v/oceans.mp4");
    // }, []);

    const commentService = new CommentService();
    const [input, setInput] = useState<string>("");

    const [commentId, setCommentId] = useState<number>(0)


    const onAddComment = async () => {
        try {
            const token = getToken();
            if (!videoID || !token) {
                return;
            }
            const response = await commentService.postComments(+videoID, input, token);
            if (response.success) {
                const newComment: CommentType = {
                    id: commentId,
                    user_id: -1,
                    user_name: user.username || "",
                    // timestamp: Date.now(),
                    content: input
                };
                setCommentsData((prev) => [...prev, newComment]);
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };



    return (
        <>
            {/* <h1>{movie?.language[user.language].title}</h1> */}

            {/* Affichage du lecteur Video.js */}
            {/* <VideoJS /> */}
            <Video video_ID={+videoID} />

            {/* Exemple de bouton pour changer la vidéo */}
            {/* <button onClick={() => setVideoSource("https://vjs.zencdn.net/v/oceans.mp4")}>
                Charger une nouvelle vidéo
            </button> */}
            <div className="Video_view">
                <CustomCard additionalClasses="flex flex-col align-center w-[700px] p-3">

                    <>
                        <input
                            type="text"
                            className="inputContainer__input first_input"
                            autoFocus
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            placeholder="Type your comment here"
                            style={{ marginRight: "20px", border: "1px solid #ccc", padding: "1px", borderRadius: "5px" }}
                        />
                        <Button variant="contained" onClick={onAddComment}>Add your comment</Button>
                    </>

                    <Comments
                        comments={commentsData}
                        handleInsertNode={handleInsertNode}
                        handleEditNode={handleEditNode}
                        handleDeleteNode={handleDeleteNode}
                    />
                </CustomCard>

            </div>
        </>
    );
}

