import Comments from "../components/Comments";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import CustomCard from "../components/Card";
import CommentService from "../services/CommentService";
import MovieService from "../services/MovieService";
import { useNode } from "../components/Comments";
import { Button } from "@mui/material";
import CommentType from "../types/Comments";

export default function StructureComments({ videoID }: { videoID: string }) {
    const [commentsData, setCommentsData] = useState<CommentType[]>([]);
    const { getToken, user } = useAuth();
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

    const handleDeleteNode = async (commentId: number) => {
        const token = getToken();
        if (!token) return console.error("No token");

        try {
            await commentService.deleteComment(commentId, token);

            const deleteFromTree = (comments: CommentType[]): CommentType[] => {
                return comments
                    .map(comment => {
                        if (comment.id === commentId) {
                            return null;
                        }
                        if (comment.replies?.length) {
                            return {
                                ...comment,
                                replies: deleteFromTree(comment.replies).filter(Boolean),
                            };
                        }
                        return comment;
                    })
                    .filter(Boolean) as CommentType[];
            };

            setCommentsData(prev => deleteFromTree(prev));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    useEffect(() => {

        async function getMovieInfo() {
            const movieService = new MovieService();

            const response = await movieService.getMovieInfo(+videoID, getToken(), user.language);
            if (!response.success) {
                console.error("Failed to fetch comments", response);
                return;
            }
            console.log("Fetched comments:", response.data.comments);

            for (let i = 0; i < response.data.comments.length; i++) {

                console.log(response.data.comments[i]);
                // response.data.comments[i].user_name = user.username;
                // response.data.comments[i].avatarUrl = user.avatar;
            }

            setCommentsData(response.data.comments);
        }

        getMovieInfo();

    }, [getToken, videoID, user.language])

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
                    avatarUrl: user.avatar || "",
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
    return (
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
    );
}