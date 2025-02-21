import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Input, TextField, Typography } from "@mui/material";
import menu_toggle from "../assets/menu_icon.svg";
import { useState } from "react";


function MenuIcon() {
    return (
        <img className="max-h-9 h-9 w-auto" src={menu_toggle} alt="menu" />
    );
}


function ToggleSidebar(
    props: {
        toggle_menu: () => void;
    }
) {
    return (
        <div onClick={props.toggle_menu}>
            <MenuIcon />
        </div>
    );
}

function Logo() {
    return (
        <Link to="/" id="logo">
            <Typography variant="h6">Hypertube</Typography>
        </Link>
    );
}

function SearchBar() {

    const [search, setSearch] = useState("");


    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(search);

    };

    return (
        <form onSubmit={handleSearchSubmit} className="flex flex-row gap-2 max-w-[300px] justify-items-center items-stretch">
            <Input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-bar"
                sx={{ width: "100%" }}
            />
        </form>
    );
}

function UserProfile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            {user != null ? (
                <div id="user-profile" className="flex flex-row items-center gap-2">
                    <p>{user.username}</p>
                    <Button variant="contained" onClick={() => { navigate(`/profile/${user.username}`) }}>Profile</Button>
                    <Button variant="contained" onClick={() => {
                        logout();
                        navigate("/");
                    }} >Logout</Button>
                </div>
            ) : (
                <div id="user-profile" className="flex flex-row items-center gap-2">
                    <Button variant="contained" onClick={() => { navigate("/login") }}>Login</Button>
                    <Button variant="contained" onClick={() => {
                        navigate("/register")
                    }}>Register</Button>
                </div>
            )}
        </>
    );
}

export default function Navbar(
    props: {
        toggle_menu: () => void;
    }
) {
    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center max-h-[50px] w-full p-3 bg-gray-950 text-white sticky top-0 z-50 border-b border-gray-500/50"
        >
            <div className="flex flex-row items-center gap-2">
                {/* <ToggleSidebar toggle_menu={props.toggle_menu} /> */}
                <Logo />
            </div>
            <SearchBar />
            <UserProfile />
        </nav>
    );
}
