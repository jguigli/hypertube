import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, IconButton, ListItemIcon, ListItemText, Menu, Typography } from "@mui/material";
import React, { useState } from "react";
import Input from "./Input.tsx"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { MenuItem } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useSearch } from "../contexts/SearchContext.tsx";

function Logo() {
    return (
        <Link to="/" id="logo">
            <Typography variant="h6">Hypertube</Typography>
        </Link>
    );
}

function SearchBar() {

    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <form className="flex flex-row gap-2 max-w-[300px] justify-items-center items-stretch">
            <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-bar"
                required={true}
            />
        </form>
    );
}

function BasicMenu() {

    const { user, logout } = useAuth();
    const { setSearchQuery } = useSearch();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | Element>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                id="account-menu-button"
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onMouseEnter={handleClick}
            >
                <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                    {/* TODO: add the profile picture of the user */}
                    {user !== null ? user.username[0].toUpperCase() : null}
                </Avatar>
            </IconButton>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': 'account-menu-button' }}
            >
                {user && (
                    <MenuItem onClick={() => {
                        handleClose();
                        navigate(`/profile/${user.username}`)
                    }}>
                        <ListItemIcon>
                            <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                    </MenuItem>
                )}

                {user && (
                    <MenuItem onClick={() => {
                        logout();
                        setSearchQuery("");
                        handleClose();
                        navigate("/");
                    }}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                    </MenuItem>
                )}

                {!user && (
                    <MenuItem onClick={() => {
                        handleClose();
                        navigate("/login");
                    }}>
                        <ListItemText>Login</ListItemText>
                    </MenuItem>
                )}

                {!user && (
                    <MenuItem onClick={() => {
                        handleClose();
                        navigate("/register");
                    }}>
                        <ListItemText>Register</ListItemText>
                    </MenuItem>
                )}

            </Menu>
        </>
    );
}

export default function Navbar() {
    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center max-h-[50px] w-full p-3 bg-gray-950 text-white sticky top-0 z-50 border-b border-gray-500/50"
        >
            <Logo />
            <SearchBar />
            <BasicMenu />
        </nav>
    );
}
