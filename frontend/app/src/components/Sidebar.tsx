import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup } from "@mui/material";
import { AppRegistrationOutlined, LoginOutlined, LogoutOutlined, Settings } from '@mui/icons-material';
import { useEffect, useState } from 'react';


export default function Sidebar() {

    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [current_page, setCurrentPage] = useState(window.location.pathname);

    useEffect(() => {
        setCurrentPage(window.location.pathname);
    }, [window.location.pathname]);

    const links = [
        {
            name: "Home",
            url: "/",
            icon: HomeIcon
        },
        user ? {
            name: "Profile",
            url: `/profile/${user.username}`,
            icon: AccountCircleIcon
        } : null,
        user ? {
            name: "Settings",
            url: "/settings",
            icon: Settings
        } : null,
        user ? {
            name: "Logout",
            url: "/logout",
            icon: LogoutOutlined
        } : null,
        !user ? {
            name: "Login",
            url: "/login",
            icon: LoginOutlined
        } : null,
        !user ? {
            name: "Register",
            url: "/register",
            icon: AppRegistrationOutlined
        } : null,
    ].filter(Boolean);

    return (
        <nav
            id="sidebar"
            className="bg-gray-950 p-4 size-fit h-full col-span-1 row-span-2 row-start-2 border-r border-gray-500/50 text-gray-50 z-50 space-y-3 gap-3"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
        >
            <div className="flex flex-col gap-2">
                <ul>
                    {links.map((link) => link && (
                        <li key={link.name} className="flex items-start gap-y-2">
                            <Link to={link.url} className="" onClick={() => setCurrentPage(link.url)}>
                                {menuOpen ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={
                                            <link.icon fontSize='small' />
                                        }
                                        className="w-full"
                                        sx={{ backgroundColor: current_page === link.url ? "primary" : "transparent" }}
                                    >
                                        {link.name}
                                    </Button>
                                ) : (
                                    <IconButton
                                        color="inherit"
                                        size="small"
                                    >
                                        <link.icon fontSize='small' />
                                    </IconButton>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            {
                menuOpen && current_page === "/" && (
                    <>
                        <div className="flex flex-col gap-2">
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Sort by</FormLabel>
                                <RadioGroup
                                    aria-label="sort-by"
                                    defaultValue="title"
                                    name="radio-buttons-group"
                                >
                                    <FormControlLabel value="title" control={<Radio />} label="Title" />
                                    <FormControlLabel value="date" control={<Radio />} label="Rating" />
                                    <FormControlLabel value="author" control={<Radio />} label="Production year" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                    </>
                )
            }
        </nav>
    );
}
