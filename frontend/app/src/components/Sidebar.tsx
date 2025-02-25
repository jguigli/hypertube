import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { AppRegistrationOutlined, LoginOutlined, LogoutOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';


export default function Sidebar(
    props: {
        open: boolean;
        toggle_menu: () => void;
    }
) {

    const { user } = useAuth();
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

        // Add profile link to sidebar if user is logged in
        user ? {
            name: "Profile",
            url: "/profile",
            icon: AccountCircleIcon
        } : null,

        // Public profile
        user ? {
            name: "Public profile",
            url: `/profile/${user.username}`,
            icon: AccountCircleIcon
        } : null,

        // Logout link if user is logged in
        user ? {
            name: "Logout",
            url: "/logout",
            icon: LogoutOutlined
        } : null,

        // Login link if user is not logged in
        !user ? {
            name: "Login",
            url: "/login",
            icon: LoginOutlined
        } : null,

        // Register link if user is not logged in
        !user ? {
            name: "Register",
            url: "/register",
            icon: AppRegistrationOutlined
        } : null,

    ].filter(Boolean);

    // On sidebar hover : toggle_menu

    const handleMouseEnter = () => {
        props.toggle_menu();
    };

    const handleMouseLeave = () => {
        props.toggle_menu();
    };


    return (
        <nav
            id="sidebar"
            className="bg-gray-950 p-4 size-fit h-full col-span-1 row-span-2 row-start-2 border-r border-gray-500/50 text-gray-50 z-50 space-y-3 gap-3"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex flex-col gap-2">
                <ul>
                    {links.map((link) => link && (
                        <li key={link.name} className="flex items-center space-x-2 my-3">
                            <Link to={link.url} className="flex items-center space-x-2" onClick={() => setCurrentPage(link.url)}>
                                <link.icon />
                                {props.open && (
                                    <span className="mx-2">
                                        {link.name}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {
                props.open && current_page === "/" && (
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
            )}
        </nav>
    );
}
