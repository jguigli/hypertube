export default interface FilterSortOptions {
    filterOptions: FilterOptions;
    sortOptions: SortOptions;
};

export interface FilterOptions {
    genre: string[];
    yearRange: number[];
    rating: number[];
};

export interface SortOptions {
    type: string;
    ascending: boolean;
};