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
import { FilterOptions, SortOptions } from "../types/FilterSortOptions";
import { useMovies } from "../contexts/MovieContext";
import { useTranslation } from "react-i18next";

const sortOptionsLabels = [
    { label: "None", value: "none.desc" },
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
    const { t } = useTranslation();
    const { filterOptions, setFilterOptions, sortOptions, setSortOptions, moviesInformation } = useMovies();

    // Nouveaux états locaux pour gérer les valeurs temporaires
    const [tempFilterOptions, setTempFilterOptions] = useState<FilterOptions>({
        genre: "All",
        yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
        rating: [moviesInformation.rating_min, moviesInformation.rating_max]
    });

    const [tempSortOptions, setTempSortOptions] = useState<SortOptions>({
        type: "none.desc",
        ascending: false
    });

    // Mettre à jour les états locaux lorsque moviesInformation change
    useEffect(() => {
        setTempFilterOptions({
            genre: filterOptions.genre,
            yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
            rating: [moviesInformation.rating_min, moviesInformation.rating_max]
        });
        setTempSortOptions(sortOptions);
    }, [moviesInformation]);

    const handleApply = () => {
        // Appliquer les valeurs temporaires aux états globaux
        setFilterOptions(tempFilterOptions);
        setSortOptions(tempSortOptions);
        toggleDrawer();
    };

    const handleReset = () => {
        // Réinitialiser les valeurs temporaires aux valeurs par défaut
        setTempFilterOptions(
            {
                genre: "All",
                yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
                rating: [moviesInformation.rating_min, moviesInformation.rating_max]
            }
        );
        setTempSortOptions({ type: "none", ascending: false });
        setFilterOptions(
            {
                genre: "All",
                yearRange: [moviesInformation.release_date_min, moviesInformation.release_date_max],
                rating: [moviesInformation.rating_min, moviesInformation.rating_max]
            }
        );
        setSortOptions({ type: "none", ascending: false });
        toggleDrawer();
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

                    <Typography variant="h6">{t("Filters")}</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper" }}
                        >{t("Genres")}</InputLabel>
                        <Select
                            value={tempFilterOptions.genre}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                setTempFilterOptions({
                                    ...tempFilterOptions,
                                    genre: typeof selectedValue === "string" ? selectedValue : selectedValue[0]
                                });
                            }}
                            size="small"
                        >
                            {moviesInformation.genres.map((genre) => (
                                <MenuItem key={genre} value={genre}>
                                    {t(genre)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography>{t("Production year")}</Typography>
                    <Slider
                        value={tempFilterOptions.yearRange}
                        onChange={(_, newValue) =>
                            setTempFilterOptions({ ...tempFilterOptions, yearRange: newValue as number[] })
                        }
                        valueLabelDisplay="auto"
                        min={moviesInformation.release_date_min}
                        max={moviesInformation.release_date_max}
                        step={1}
                        size="small"
                    />

                    <Typography>{t("IMDb ratings")}</Typography>
                    <Slider
                        value={tempFilterOptions.rating}
                        onChange={(_, newValue) =>
                            setTempFilterOptions({ ...tempFilterOptions, rating: newValue as number[] })
                        }
                        valueLabelDisplay="auto"
                        min={moviesInformation.rating_min}
                        max={moviesInformation.rating_max}
                        step={0.1}
                        size="small"
                    />

                    <Typography variant="h6">{t("Sort")}</Typography>

                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            sx={{ bgcolor: "background.paper" }}
                        >{t("Sort by")}</InputLabel>
                        <Select
                            value={tempSortOptions.type + (tempSortOptions.ascending ? ".asc" : ".desc")}
                            onChange={(e) => {
                                const [type, order] = e.target.value.split(".");
                                setTempSortOptions({
                                    type,
                                    ascending: order === "asc"
                                });
                            }}
                            size="small"
                        >
                            {sortOptionsLabels.map((option) => (
                                <MenuItem key={option.label} value={option.value}>
                                    {t(option.label)}
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
                            {t("Reset")}
                        </Button>
                        <Button variant="contained" onClick={handleApply}>
                            {t("Apply")}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
