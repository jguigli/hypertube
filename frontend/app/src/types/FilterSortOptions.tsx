export default interface FilterSortOptions {
    selectedGenre: string;
    yearRange: number[];
    rating: number[];
    sortBy: string;
};

export interface FilterOptions {
    genre: string;
    yearRange: number[];
    rating: number[];
};

export interface SortOptions {
    type: string;
    ascending: boolean;
};