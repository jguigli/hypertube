import {
    Box, Drawer, Button, Fab, Slider, Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";
import FilterSortOptions, { SortOptions } from "../types/FilterSortOptions";
import { useMovies } from "../contexts/MovieContext";

const sortOptionsLabels = [
    { label: "None", value: "none" },
    { label: "Name (A-Z)", value: "name.asc" },
    { label: "Name (Z-A)", value: "name.desc" },
    { label: "Production year (newest first)", value: "production_year.desc" },
    { label: "Production year (oldest first)", value: "production_year.asc" },
    { label: "IMDb rating (highest first)", value: "imdb_rating.desc" },
    { label: "IMDb rating (lowest first)", value: "imdb_rating.asc" }
];

export function FilterSortMenu({ onApply, initialCategories, sortOptionsLabel, initialYearRange, initialRating }: {
    onApply: (filters: FilterSortOptions) => void,
    initialCategories: string[],
    sortOptionsLabel: string,
    initialYearRange: number[],
    initialRating: number[]
}) {

    const { moviesInformation } = useMovies();
    const [open, setOpen] = useState(false);
    const [movieCategories, setMovieCategories] = useState<string[]>(initialCategories)
    const [yearRange, setYearRange] = useState<number[] | number>(initialYearRange);
    const [rating, setRating] = useState<number[] | number>(initialRating);
    const [sortOptions, setSortOptions] = useState<string>(sortOptionsLabel);

    const toggleDrawer = () => setOpen(!open);

    const handleApply = () => {
        const splitted_sortOptions = sortOptions.split(".");
        const type = splitted_sortOptions[0];
        const ascending = splitted_sortOptions[1] === "asc";
        const sortOptionsValue: SortOptions = {
            type: type,
            ascending: ascending
        };
        onApply(
            {
                filterOptions: {
                    genre: movieCategories,
                    yearRange: typeof (yearRange) === "number" ? [yearRange, yearRange] : yearRange,
                    rating: typeof (rating) === "number" ? [rating, rating] : rating
                },
                sortOptions: sortOptionsValue
            }
        );
        toggleDrawer();
    };

    const handleReset = () => {
        setMovieCategories(moviesInformation.genres)
        setYearRange([moviesInformation.release_date_min, moviesInformation.release_date_max]);
        setRating([moviesInformation.rating_min, moviesInformation.rating_max]);
        setSortOptions("none");
    };

    return (
        <>
            <Fab
                color="primary"
                onClick={toggleDrawer}
                sx={{ position: "fixed", bottom: 16, right: 16 }}
            >
                <FilterListIcon />
            </Fab>

            <Drawer anchor="bottom" open={open} onClose={toggleDrawer}>
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }} className="bg-gray-950">

                    <Typography variant="h6">Filters</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper" }}
                        >Genres</InputLabel>
                        <Select
                            value={movieCategories}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (typeof selectedValue === "string") {
                                    setMovieCategories([selectedValue]);

                                } else {
                                    setMovieCategories(selectedValue);
                                }
                            }}
                            size="small"
                        >
                            {moviesInformation.genres.map((genre) => (
                                <MenuItem key={genre} value={genre}>
                                    {genre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography>Production year</Typography>
                    <Slider
                        value={yearRange}
                        onChange={(_, newValue) => setYearRange(newValue)}
                        valueLabelDisplay="auto"
                        min={moviesInformation.release_date_min}
                        max={moviesInformation.release_date_max}
                        step={1}
                        size="small"
                    />

                    <Typography>IMDb ratings</Typography>
                    <Slider
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        valueLabelDisplay="auto"
                        min={moviesInformation.rating_min}
                        max={moviesInformation.rating_max}
                        step={0.1}
                        size="small"
                    />

                    <Typography variant="h6">Sort</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper" }}
                        >Sort by</InputLabel>
                        <Select
                            value={sortOptions}
                            onChange={(e) => (setSortOptions(e.target.value))}
                            size="small"
                        >
                            {sortOptionsLabels.map((option) => (
                                <MenuItem key={option.label} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{
                        display: "flex", justifyContent: "flex-end", mt: 2, gap: 2
                    }}>
                        <Button
                            onClick={handleReset}
                            startIcon={<ClearIcon />}
                            color="secondary"
                        >
                            Reset
                        </Button>
                        <Button variant="contained" onClick={handleApply}>
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
