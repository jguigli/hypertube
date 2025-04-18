import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";
import { useAuth } from "./AuthContext";
import MovieService from "../services/MovieService";

export interface MoviesInformation {
    release_date_min: number;
    release_date_max: number;
    rating_min: number;
    rating_max: number;
    genres: string[];
}

interface FilterSortContextType {
    filterOptions: FilterOptions;
    setFilterOptions: (options: FilterOptions) => void;
    sortOptions: SortOptions;
    setSortOptions: (options: SortOptions) => void;
    moviesInformation: MoviesInformation;
}

const FilterSortContext = createContext<FilterSortContextType | undefined>(undefined);

export function FilterSortProvider({ children }: { children: React.ReactNode }) {

    const { user, getToken } = useAuth();
    const movieService = new MovieService();

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        genre: "All",
        yearRange: [0, new Date().getFullYear()],
        rating: [0, 10]
    });

    const [sortOptions, setSortOptions] = useState<SortOptions>({
        type: "none",
        ascending: false
    });

    const [moviesInformation, setMoviesInformation] = useState<MoviesInformation>({
        release_date_min: 0,
        release_date_max: 0,
        rating_min: 0,
        rating_max: 10,
        genres: []
    });

    const fetchMoviesInformation = useCallback(async () => {
        const token = getToken();
        try {
            const response = await movieService.getMoviesInformation(token, user.language);
            if (response.success) {
                setMoviesInformation({
                    release_date_min: response.data.release_date.min,
                    release_date_max: response.data.release_date.max,
                    rating_min: response.data.vote_average.min,
                    rating_max: response.data.vote_average.max,
                    genres: response.data.genres
                });
                setFilterOptions({
                    genre: "All",
                    yearRange: [response.data.release_date.min, response.data.release_date.max],
                    rating: [response.data.vote_average.min, response.data.vote_average.max]
                });
                setSortOptions({
                    type: "none",
                    ascending: false
                });
            }
        } catch (error) {
            console.error("Failed to fetch movies information:", error);
        }
    }, [user.language]);

    useEffect(() => {
        fetchMoviesInformation();
    }, [fetchMoviesInformation]);

    return (
        <FilterSortContext.Provider value={{
            filterOptions,
            setFilterOptions,
            sortOptions,
            setSortOptions,
            moviesInformation
        }}>
            {children}
        </FilterSortContext.Provider>
    );

}

export function useFilterSort() {
    const context = useContext(FilterSortContext);
    if (!context) {
        throw new Error("useFilterSort must be used within a FilterSortProvider");
    }
    return context;
}
