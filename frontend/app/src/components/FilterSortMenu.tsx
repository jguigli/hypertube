import {
    Box, Drawer, Button, Fab, TextField, Slider, Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { useState } from "react";
import FilterSortOptions, { SortOptions } from "../types/FilterSortOptions";

const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "TV Movie",
    "Thriller",
    "War",
    "Western"
];
const sortOptionsLabels = [
    { label: "None", value: "none" },
    { label: "Name (A-Z)", value: "name.asc" },
    { label: "Name (Z-A)", value: "name.desc" },
    { label: "Production year (newest first)", value: "production_year.desc" },
    { label: "Production year (oldest first)", value: "production_year.asc" },
    { label: "IMDb rating (highest first)", value: "imdb_rating.desc" },
    { label: "IMDb rating (lowest first)", value: "imdb_rating.asc" }
];

export function FilterSortMenu({ onApply }: { onApply: (filters: FilterSortOptions) => void }) {

    const [open, setOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [yearRange, setYearRange] = useState<number[]>([1950, new Date().getFullYear()]);
    const [rating, setRating] = useState<number[]>([0, 10]);

    const [sortOptions, setSortOptions] = useState<string>("none");

    const toggleDrawer = () => setOpen(!open);

    const handleApply = () => {

        console.log("Applying filters");
        console.log(sortOptions);

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
                    genre: selectedGenre,
                    yearRange: yearRange,
                    rating: rating
                },
                sortOptions: sortOptionsValue
            }
        );
        toggleDrawer();
    };


    const handleReset = () => {
        setSelectedGenre("");
        setYearRange([1950, new Date().getFullYear()]);
        setRating([0, 10]);
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

                    {/* <Typography variant="h6">Filters</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper"}}
                        >Genres</InputLabel>
                        <Select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            size="small"
                        >
                            {genres.map((genre) => (
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
                        min={1950}
                        max={new Date().getFullYear()}
                        step={1}
                        size="small"
                    />

                    <Typography>IMDb ratings</Typography>
                    <Slider
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        valueLabelDisplay="auto"
                        min={0}
                        max={10}
                        step={0.1}
                        size="small"
                    /> */}

                    <Typography variant="h6">Sort</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper"}}
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
