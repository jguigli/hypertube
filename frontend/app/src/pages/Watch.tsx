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
    parent_id: number | null;
    content: string;
    replies: CommentType[];
    timestamp: number;
    
}


export default function Watch() {
    
    const movieService = new MovieService();
    const { getToken, user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const safeID = id || '42';
    const [ismovieReady, setMovieReady] = useState<boolean>(false);

    // POST /api/download
    useEffect(() => {
        async function getDownloadMovie() {
        const response = await movieService.checkMovieDownloadStatus(safeID, getToken());
        console.log("Appelle de la fonction download.")
    }
    getDownloadMovie();
    }, [getToken])


    const [commentsData, setCommentsData] = useState<CommentType[]>([]);

    const { insertNode, editNode, deleteNode } = useNode();

    const handleInsertNode = (commentId: number, value: string): void => {
        if (!value.trim() || !videoID) return;
        const rootComment = commentsData.length > 0 ? commentsData[0] : null;
        if (!rootComment) return;

        const finalStructure = insertNode(rootComment, commentId, value, +videoID);
        setCommentsData(Array.isArray(finalStructure) ? finalStructure : [finalStructure]);
    };

    const handleEditNode = (commentId: number, value: string, newTimestamp: number): void => {
        if (!value.trim()) return;

        const updateContentInPlace = (comments: CommentType[]): CommentType[] => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, content: value, timestamp: newTimestamp };
                }
                if (comment.replies?.length) {
                    return { ...comment, replies: updateContentInPlace(comment.replies) };
                }
                return comment;
            });
        };

        setCommentsData(prev => updateContentInPlace(prev));
    };

    const handleDeleteNode = (commentId: number): void => {
        const rootComment = commentsData.length > 0 ? commentsData[0] : null;
        if (!rootComment) return;

        const finalStructure = deleteNode(rootComment, commentId);
        setCommentsData(finalStructure ? (Array.isArray(finalStructure) ? finalStructure : [finalStructure]) : commentsData);
    };

    const videoID = id ? parseInt(id, 10) : null;
    const navigate = useNavigate();


    useEffect(() => {

        async function getMovieInfo() {
            const movieService = new MovieService();

            if (!videoID || isNaN(videoID)) {
                navigate("/");
                return;
            }
            const response = await movieService.getMovieInfo(+videoID, getToken(), user.language);
            if (!response.success) {
                console.error("Failed to fetch comments", response);
                return;
            }
            console.log("Fetched comments:", response.data.comments);

            setCommentsData(response.data.comments);
        }

        getMovieInfo();

    }, [getToken, navigate, videoID])

    const commentService = new CommentService();
    const [input, setInput] = useState<string>("");

    const onAddComment = async () => {
        try {
            const token = getToken();
            if (!videoID || !token) {
                return;
            }
            const newTimestamp = Math.floor(Date.now() / 1000);
            const response = await commentService.postComments(+videoID, input, token, null, newTimestamp);
            if (response.success) {
                const newComment: CommentType = {
                    id: response.data.id,
                    user_id: response.data.user_id,
                    user_name: user.username || "",
                    parent_id: response.data.parent_id,
                    timestamp: response.data.timestamp,
                    content: input,
                    replies: []
                };
                setCommentsData((prev) => [...prev, newComment]);
            }
            console.log("Response data from backend (main comment):", response.data);
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
        setInput("")
    };



    if (!videoID || isNaN(videoID)) {
        console.error("Invalid videoID:", id);
        return navigate("/")
    }

    return (
        <>
            <Video video_ID={+videoID} />

            <div className="Video_view">
                <CustomCard additionalClasses="flex flex-col align-center w-[700px] p-3">

                    <>
                        <input
                            type="text"
                            className="inputContainer__input first_input"
                            autoFocus
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onAddComment()}
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
                        setCommentsData={setCommentsData}
                    />
                </CustomCard>

            </div>
        </>
    );
}
