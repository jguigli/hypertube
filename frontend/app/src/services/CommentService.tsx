import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class CommentService {

    async postComments(movie_id: number, content: string, token: string) {
        console.log("Posting comment with:", { movie_id, content, token });

        try {
            const response = await axios.post(
                `/comments/${movie_id}`,
                { content },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
                    }
                }
            );

            return {
                success: response.status === 204,
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


    // Search comments by query
    // GET /api/movies/search/

    async getMovieInfo(id: number, token: string | null) {
        try {
            if (token) {
                const response = await axios.get(
                    `/movies/${id}`,
                    {
                        headers: {
                            Authorization: `${token}`
                        },
                        params: {
                            movie_id: id
                        }
                    }
                );
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.data
                    }
                }
            }
            return {
                success: false,
                data: null
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error posting comment:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error:", error);
            }
            return {
                success: false,
                data: null
            }
        }
    }
}