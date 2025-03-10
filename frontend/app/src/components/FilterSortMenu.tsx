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
const sortOptions = [
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Production year (newest first)", value: "year_desc" },
    {label: "Production year (oldest first)", value: "year_asc" },
    { label: "IMDb rating (highest first)", value: "rating_desc" },
    { label: "IMDb rating (lowest first)", value: "rating_asc" }
];

export function FilterSortMenu({ onApply }: { onApply: (filters: any) => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [yearRange, setYearRange] = useState([1950, 2025]);
    const [rating, setRating] = useState([0, 10]);
    const [sortBy, setSortBy] = useState("");

    const toggleDrawer = () => setOpen(!open);

    const handleApply = () => {
        onApply({ name, selectedGenre, yearRange, rating, sortBy });
        toggleDrawer();
    };

    const handleReset = () => {
        setName("");
        setSelectedGenre("");
        setYearRange([1950, 2025]);
        setRating([0, 10]);
        setSortBy("");
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

                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="small"
                    />

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
                    />

                    <Typography variant="h6">Sort</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper"}}
                        >Sort by</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            size="small"
                        >
                            {sortOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
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
