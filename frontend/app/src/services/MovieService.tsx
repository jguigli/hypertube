import { Language } from "@mui/icons-material";
import axios from "axios";
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class MovieService {

    // Get popular movies by page
    // GET /api/movies/popular/:page
    async getPopularMovies(
        page: number,
        language: string = "en",
        filterOptions: FilterOptions,
        sortOptions: SortOptions,
        token: string | null
    ) {

        try {

            if (!token) {
                return {
                    success: false,
                    data: null
                }
            }

            const response = await axios.post(
                `/movies/popular/${page}`,
                {
                    page: page,
                    language: language,
                    filter_options: {
                        categories: filterOptions.genre,
                        production_year_low: filterOptions.yearRange[0],
                        production_year_high: filterOptions.yearRange[1],
                        imdb_rating_low: filterOptions.rating[0],
                        imdb_rating_high: filterOptions.rating[1],
                    },
                    sort_options: sortOptions,
                },
                {
                    headers: {
                        Authorization: `${token}`
                    }
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
    async searchMovies(
        query: string,
        language: string = "en",
        page: number = 1,
        filterOptions: FilterOptions,
        sortOptions: SortOptions,
        token: string | null
    ) {
        try {

            if (!token) {
                return {
                    success: false,
                    data: null
                }
            }

            const response = await axios.post(
                `/movies/search`,
                {
                    search: query,
                    language: language,
                    page: page,
                    filter_options: {
                        categories: filterOptions.genre,
                        production_year_low: filterOptions.yearRange[0],
                        production_year_high: filterOptions.yearRange[1],
                        imdb_rating_low: filterOptions.rating[0],
                        imdb_rating_high: filterOptions.rating[1],
                    },
                    sort_options: sortOptions
                },
                {
                    headers: {
                        Authorization: `${token}`
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



    async getMovieInfo(id: number, token: string | null, language: string) {
        try {
            if (token) {
                const response = await axios.get(
                    `/movies/${id}`,
                    {
                        headers: {
                            Authorization: `${token}`
                        },
                        params: {
                            movie_id: id,
                            language: language
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


    // Get movies information (min and max release year, min and max rating, genres)
    // GET /api/movies/information
    async getMoviesInformation(token: string | null, language: string) {
        try {
            if (token) {
                const response = await axios.get(
                    `/movies/informations`,
                    {
                        headers: {
                            Authorization: `${token}`
                        },
                        params: {
                            language: language
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

    //Recuperation de la reponse de la route /movies/{movie_id}/download
    async checkMovieDownloadStatus(movie_id: string, token: string) {
        try {
            if (!token) return ;

            const response = await axios.post(
                `/movies/${movie_id}/download`,
                {
                    movie_id
                },
                {
                    headers: {
                        Authorization: `${token}`
                    }
                }
            );
            if (response.status === 200) {
                console.log("Download status 200.")
                return { status: 200, message: "Status 200" }
            }
            if (response.status === 202) {
                console.log("Download status 202.")
                return { status: 202, message: "Status 202" }
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log("Download status 422")
                return { status: 422, message: "Status 422" }
            }
        }
    }
    // Get top movies
    // GET /api/movies/top
    async getTopMovies(language: string) {

        try {
            const response = await axios.get(`/movies/top`, {
                params: {
                    language: language
                }
            });
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data
                };
            }
            return {
                success: false,
                data: null
            };
        } catch (error) {
            return {
                success: false,
                data: null
            };
        }
    }

}