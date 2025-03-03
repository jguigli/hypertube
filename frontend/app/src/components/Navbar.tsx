import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconButton, InputBase, Typography } from "@mui/material";
import React from "react";
import { MenuItem } from "@mui/material";
import { useSearch } from "../contexts/SearchContext.tsx";
import { Search } from "@mui/icons-material";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';


function Logo() {
    return (
        <div className="flex flex-row items-center gap-1">
            <Link to="/" id="logo">
                <PlayCircleOutlineIcon />
            </Link>
            <Link to="/" id="logo">
                <Typography variant="h6">Hypertube</Typography>
            </Link>
        </div>
    );
}

function SearchBar() {

    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <div className="flex flex-row items-center w-full bg-gray-800 rounded-md mx-4 max-w-[400px]">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-row items-center w-full">
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'inherit' }}
                        placeholder="Search movies"
                        value={searchQuery}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchQuery(event.target.value);
                        }}
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

    const { user, changeUserLanguage } = useAuth();

    const handleChange = (event: SelectChangeEvent) => {
        const language = event.target.value;
        if (language === "en" || language === "fr") {
            changeUserLanguage(language);
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


export default function Navbar() {

    const { user } = useAuth();

    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center max-h-[50px] w-full p-3 bg-gray-950 text-white sticky top-0 z-50 border-b border-gray-500/50"
        >
            <Logo />
            {user.is_logged_in && <SearchBar />}
            <LanguageSelection />
        </nav>
    );
}
