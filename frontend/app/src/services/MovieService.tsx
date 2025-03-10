import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class MovieService {

    // Get popular movies by page
    // GET /api/movies/popular/:page
    async getPopularMovies(page: number, language: string = "en") {

        // curl - X 'GET' \
        // 'http://localhost:3000/api/movies/popular/1?language=en' \
        // -H 'accept: application/json'

        try {
            const response = await axios.get(
                `/movies/popular/${page}`,
                {
                    params: {
                        page: page,
                        language: language
                    }
                }
            );
            if (response.status === 200) {
                return response.data;
            } else {
                console.error(response.data);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

}