import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class CommentService {

    async postComments(movie_id: number, content: string, token: string, parent_id: number | null = null) {
        console.log("Posting comment with:", { movie_id, content, token, parent_id });

        try {
            const response = await axios.post(
                `/comments/${movie_id}`,
                {
                    content,
                    parent_id
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
}