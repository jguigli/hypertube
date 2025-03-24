import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class CommentService {

    async postComments(movie_id: number, content: string, token: string, parent_id: number | null = null, timestamp: number) {
        console.log("Posting comment with:", { movie_id, content, token, parent_id, timestamp });

        try {
            const response = await axios.post(
                `/comments/${movie_id}`,
                {
                    content,
                    parent_id,
                    timestamp
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
                    }
                }
            );
            console.log(response)
            return {
                success: response.status === 200,
                data: response.data,
            };
        }
        catch (error) {
            console.error("Error posting comment:", error);
            return {
                success: false,
                data: null,
            };
        }
    }

    async editComment(commentId: number, newContent: string, token: string): Promise<any> {
        console.log("Token used in editComment:", token);
        const response = await fetch(`/api/comments/${commentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
            },
            body: JSON.stringify({
                content: newContent,
                timestamp: Math.floor(Date.now() / 1000)
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to edit comment");
        }

        return await response.json();
    }

}