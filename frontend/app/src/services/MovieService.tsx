import axios from "axios";
import { SortOptions } from "../types/FilterSortOptions";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class MovieService {

    // Get popular movies by page
    // GET /api/movies/popular/:page
    async getPopularMovies(page: number, language: string = "en", sortOptions: SortOptions) {

        try {

            const response = await axios.post(
                `/movies/popular/${page}`,
                {
                    page: page,
                    language: language,
                    sort_options: sortOptions
                }
            );
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data
                };
            } else if (response.status === 204) {
                return {
                    success: true,
                    data: []
                }
            } else {
                console.log(response.data);
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
            } else if (response.status === 204) {
                return {
                    success: true,
                    data: []
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