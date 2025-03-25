import {
    Box, Drawer, Button, Fab, Slider, Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useState } from "react";
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

export function FilterSortMenu() {

    const [open, setOpen] = useState(false);
    const toggleDrawer = () => setOpen(!open);

    // const { filterOptions, setFilterOptions, sortOptions, setSortOptions, moviesInformation } = useMovies();

    const handleApply = () => {
        // Fetch movies with updated filters and sort options
    };

    const handleReset = () => {
        // setFilterOptions(FilterSortOptions.defaultFilterOptions);
        // setSortOptions(FilterSortOptions.defaultSortOptions);
    };

    return (
        <>
            {/* <Fab
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
                            value={filterOptions.genre}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (typeof selectedValue === "string") {
                                    setCategory(selectedValue);
                                } else {
                                    setCategory(selectedValue[0]);
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
                        value={filterOptions.yearRange}
                        onChange={(_, newValue) => setYearRange(newValue)}
                        valueLabelDisplay="auto"
                        min={moviesInformation.release_date_min}
                        max={moviesInformation.release_date_max}
                        step={1}
                        size="small"
                    />

                    <Typography>IMDb ratings</Typography>
                    <Slider
                        value={filterOptions.rating}
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
                            value={sortOptions.type}
                            onChange={(e) => (setSort(e.target.value))}
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
            </Drawer> */}
        </>
    );
}
