import axios from "axios";
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";

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
                console.log(response);
                if (response.status === 200) {
                    return { status: 200, data: response.data }
                }
                else if (response.status === 400) {
                    return { status: 400, data: null }
                }
                else if (response.status === 404) {
                    return { status: 404, data: null }
                }
            }
            return {
                status: 401,
                data: null
            }
        }
        catch (error: any) {
            return {
                status: error.response?.status || 0,
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

    //Recuperation de la reponse de la route /movies/{movie_id}/download
    // async checkMovieDownloadStatus(movie_id: string, token: string) {
    //     try {

    //         if (!token) return {
    //             status: 401,
    //             message: "Unauthorized"
    //         }

    //         const response = await axios.post(
    //             `/movies/${movie_id}/download`,
    //             { movie_id },
    //             {
    //                 headers: {
    //                     Authorization: `${token}`
    //                 }
    //             }
    //         );

    //         // 400 : Invalid movie id -> Redirect to 404 page
    //         // 404 : No torrent file found for this movie
    //         // 200 : Download in progress
    //         // 202 : Movie is available for streaming

    //         if (response.status === 200) {
    //             return { status: 200, message: "Download in progress" }
    //         } else if (response.status === 202) {
    //             return { status: 202, message: "Movie is available for streaming" }
    //         } else if (response.status === 400) {
    //             return { status: 400, message: "Invalid movie_id" }
    //         } else if (response.status === 404) {
    //             return { status: 404, message: "No torrent file found for this movie" }
    //         } else {
    //             return { status: 0, message: "Unexpected error" }
    //         }
    //     } catch (error: any) {
    //         console.log(error);
    //         return { status: error.response?.status || 0, message: "Unexpected error" }
    //     }
    // }


    // Get subtitles for a movie
    async getSubtitles(video_id: number, token: string | null) {
        try {
            if (token) {
                const response = await axios.get(
                    `/movies/${video_id}/${token}/subtitles`,
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
                }
            }
            return {
                success: false,
                data: null
            }
        } catch (error) {
            return {
                success: false,
                data: null
            }
        }

    }

}