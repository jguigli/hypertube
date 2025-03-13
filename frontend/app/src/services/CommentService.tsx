import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class CommentService {

    async postComments(movie_id: number, content: string, token: string) {

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
            return {
                success: false,
                data: null
            }
        }
    }
}