import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconButton, InputBase, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MenuItem } from "@mui/material";
import { useSearch } from "../contexts/SearchContext.tsx";
import { Search } from "@mui/icons-material";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useActiveLink } from "../contexts/ActiveLinkContext.tsx";
import UserService from "../services/UserService.tsx";
import MovieService from "../services/MovieService.tsx";
import { useMovies } from "../contexts/MovieContext.tsx";
import { set } from "video.js/dist/types/tech/middleware";


function Logo() {

    const { setActiveLink } = useActiveLink();

    return (
        <div className="flex flex-row items-center gap-1">
            <Link to="/" id="logo" onClick={() => setActiveLink("/")}>
                <PlayCircleOutlineIcon />
            </Link>
            <Link to="/" id="logo" onClick={() => setActiveLink("/")}>
                <Typography variant="h6">Hypertube</Typography>
            </Link>
        </div>
    );
}

function MovieSearchBar() {

    const { setSearchQuery } = useSearch();
    const { user } = useAuth();
    const { setMovies } = useMovies();

    const movieService = new MovieService();

    const [search, setSearch] = useState("");

    async function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
        setSearchQuery(event.target.value);
    }

    useEffect(() => {
        if (search.length === 0) {
            movieService.getPopularMovies(1, user.language)
                .then((response) => {
                    if (!response.success) {
                        return;
                    }
                    setMovies(response.data);
                });
        } else {
            movieService.searchMovies(search, user.language)
                .then((response) => {
                    if (!response.success) {
                        return;
                    }
                    setMovies(response.data);
                });
        }
    }, [search]);

    return (
        <div className="flex flex-row items-center w-full bg-gray-800 rounded-md mx-4 max-w-[400px]">
            <form onSubmit={(event) => event.preventDefault()}>
                <div className="flex flex-row items-center w-full">
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'inherit' }}
                        placeholder="Search movies"
                        value={search}
                        onChange={handleSearchChange}
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

export function LanguageSelection() {

    const { user, getToken, changeUserLanguage } = useAuth();
    const userService = new UserService();

    const handleChange = (event: SelectChangeEvent) => {
        const language = event.target.value;
        if (language === "en" || language === "fr") {
            changeUserLanguage(language);
            if (user.is_logged_in && user.email && user.username && user.firstName && user.lastName) {
                const token = getToken();
                if (!token) {
                    return;
                }
                userService.setInformations(
                    token,
                    user.email,
                    user.username,
                    user.firstName,
                    user.lastName,
                    language
                );
            }
        }
    };

    return (
        <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
            <InputLabel size="small" id="demo-select-small-label" sx={{ paddingTop: 0.5 }}>Language</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={user.language}
                label="Language"
                onChange={handleChange}
                size="small"
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
            </Select>
        </FormControl>
    );
}

function UserSearchBar() {

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
                        placeholder="Search users"
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
