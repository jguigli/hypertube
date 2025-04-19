import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconButton, InputBase, Typography } from "@mui/material";
import React, { useState } from "react";
import { MenuItem } from "@mui/material";
import { Clear, Search } from "@mui/icons-material";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useActiveLink } from "../contexts/ActiveLinkContext.tsx";
import { useTranslation } from 'react-i18next';
import { useSearch } from "../contexts/SearchContext.tsx";
import { useMovies } from "../contexts/MovieContext";
import { useFilterSort } from "../contexts/FilterSortContext";


function Logo() {

    const { setActiveLink } = useActiveLink();
    const { resetSearch } = useSearch();
    const { resetFilterSort } = useFilterSort();

    // Function to handle link click
    function navigateTo(link: string) {
        if (link === "/") {
            resetSearch();
            resetFilterSort();
        }
        setActiveLink(link);
    }

    return (
        <div className="flex flex-row items-center gap-1">
            <Link to="/" id="logo" onClick={() => navigateTo("/")}>
                <PlayCircleOutlineIcon />
            </Link>
            <Link to="/" id="logo" onClick={() => navigateTo("/")}>
                <Typography variant="h6">Hypertube</Typography>
            </Link>
        </div>
    );
}

function MovieSearchBar() {

    const { t } = useTranslation();
    const { searchQuery, setSearchQuery } = useSearch();
    const [search, setSearch] = useState("");

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    function handleClearSearch() {
        setSearch("");
        setSearchQuery("");
    }

    function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearchQuery(search);
    }

    return (
        <div className="flex flex-row items-center w-full bg-gray-800 rounded-md mx-4 max-w-[400px]">
            <form onSubmit={handleSearchSubmit}>
                <div className="flex flex-row items-center w-full">
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'inherit' }}
                        placeholder={t("Search movies")}
                        value={search}
                        onChange={handleSearchChange}
                        inputProps={{ 'aria-label': t('Search movies') }}
                    />
                    {searchQuery.length > 0 && (
                        <IconButton onClick={handleClearSearch} sx={{ p: '5px' }} aria-label="clear search">
                            <Clear />
                        </IconButton>
                    )}
                    <IconButton type="submit" sx={{ p: '5px', mr: 2 }} aria-label="search">
                        <Search />
                    </IconButton>
                </div>
            </form>
        </div>
    );
}

export function LanguageSelection() {
    const { i18n, t } = useTranslation();
    const { changeUserLanguage } = useAuth();
    const { activeLink } = useActiveLink();
    const { user } = useAuth();

    const handleChange = (event: SelectChangeEvent) => {
        const lang = event.target.value;
        if (lang === 'en' || lang === 'fr') {
            i18n.changeLanguage(lang);
            changeUserLanguage(lang);
        }
    };

    if (activeLink.includes('watch') && user.is_logged_in) {
        // Don't show language selection on watch page
        return <span className="min-w-[120px]"></span>;
    }

    return (
        <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
            <InputLabel id="language-label" sx={{ paddingTop: 0.5 }}>
                {t("Language")}
            </InputLabel>
            <Select
                labelId="language-label"
                id="language-select"
                value={i18n.language}
                label={t("Language")}
                onChange={handleChange}
                size="small"
            >
                <MenuItem value="en">{t("English")}</MenuItem>
                <MenuItem value="fr">{t("Français")}</MenuItem>
            </Select>
        </FormControl>
    );
}

function UserSearchBar() {

    const { t } = useTranslation();
    const [userSearch, setUserSearch] = useState("");
    const { setActiveLink } = useActiveLink();
    const navigate = useNavigate()

    function handleUserSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUserSearch(event.target.value);
    }

    function handleUserSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUserSearch("");
        setActiveLink(`/profile`);
        navigate(`/profile/${userSearch}`);
    }

    return (
        <div className="flex flex-row items-center w-full bg-gray-800 rounded-md mx-4 max-w-[400px]">
            <form onSubmit={handleUserSearchSubmit}>
                <div className="flex flex-row items-center w-full">
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'inherit' }}
                        placeholder={t("Search users")}
                        value={userSearch}
                        onChange={handleUserSearchChange}
                        inputProps={{ 'aria-label': 'search movies' }}
                    />
                    <IconButton type="submit" sx={{ p: '5px', mr: 2 }} aria-label="search">
                        <Search />
                    </IconButton>
                </div>
            </form>
        </div>
    );
}


export default function Navbar() {

    const { user } = useAuth();
    const { activeLink } = useActiveLink();

    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center max-h-[50px] w-full p-3 bg-gray-950 text-white sticky top-0 z-50 border-b border-gray-500/50"
        >
            <Logo />

            {
                user.is_logged_in && (
                    (activeLink.includes('profile') || activeLink.includes('settings')) ? (
                        <UserSearchBar />
                    ) : (
                        <MovieSearchBar />
                    )
                )
            }
            <LanguageSelection />
        </nav>
    );
}
