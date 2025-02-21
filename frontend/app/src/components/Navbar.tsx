import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, ListItemIcon, ListItemText, Menu, Typography } from "@mui/material";
import menu_toggle from "../assets/menu_icon.svg";
import { useEffect, useState } from "react";
import Input from "./Input.tsx"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { MenuItem } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';


function MenuIcon() {
    return (
        <img className="max-h-9 h-9 w-auto" src={menu_toggle} alt="menu" />
    );
}


// function ToggleSidebar(
//     props: {
//         toggle_menu: () => void;
//     }
// ) {
//     return (
//         <div onClick={props.toggle_menu}>
//             <MenuIcon />
//         </div>
//     );
// }

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
                required={true}
            />
        </form>
    );
}

function BasicMenu() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | Element>(null);
    const open = Boolean(anchorEl);
    let menu_items = [];

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (user != null) {
        menu_items.push(
            <MenuItem onClick={() => {
                handleClose();
                navigate(`/profile/${user.username}`)
            }}>
                <ListItemIcon>
                    <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>

            </MenuItem>,
            <MenuItem onClick={() => {
                handleClose();
                logout();
                navigate("/");
            }}>
                <ListItemIcon>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
            </MenuItem>
        );
    } else {
        menu_items.push(
            <MenuItem onClick={() => {
                handleClose();
                navigate("/login");
            }}>
                <ListItemText>Login</ListItemText>
            </MenuItem>,
            <MenuItem onClick={() => {
                handleClose();
                navigate("/register");
            }}>
                <ListItemText>Register</ListItemText>
            </MenuItem>
        );
    }

    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <AccountCircleIcon />
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {menu_items}
            </Menu>
        </div>
    );
}

export default function Navbar() {
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
            {/* <UserProfile /> */}
            <BasicMenu />
        </nav>
    );
}
