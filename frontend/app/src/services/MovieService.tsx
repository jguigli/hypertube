import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class MovieService {

    // Get popular movies by page
    // GET /api/movies/popular/:page
    async getPopularMovies(page: number, language: string = "en") {

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
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    data: response.data
                };
            }
        }
        catch (error) {
            return {
                success: false,
                data: null
            };
        }
    }


    // Search movies by query
    // GET /api/movies/search/
    async searchMovies(query: string, language: string = "en", page: number = 1) {
        try {
            const response = await axios.get(
                `/movies/search`,
                {
                    params: {
                        search: query,
                        language: language,
                        page: page
                    }
                }
            );
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data
                }
            } else {
                return {
                    success: false,
                    data: response.data
                }
            }
        }
        catch (error) {
            return {
                success: false,
                data: null
            }
        }
    }


    // Get movie details by id
}