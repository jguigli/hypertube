import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@mui/material";
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
        user.is_logged_in ? {
            name: "Profile",
            url: `/profile/${user.username}`,
            icon: AccountCircleIcon
        } : null,
        user.is_logged_in ? {
            name: "Settings",
            url: "/settings",
            icon: Settings
        } : null,
        user.is_logged_in ? {
            name: "Logout",
            url: "/logout",
            icon: LogoutOutlined
        } : null,
        !user.is_logged_in ? {
            name: "Login",
            url: "/login",
            icon: LoginOutlined
        } : null,
        !user.is_logged_in ? {
            name: "Register",
            url: "/register",
            icon: AppRegistrationOutlined
        } : null,
    ].filter(Boolean);

    return (
        <nav
            id="sidebar"
            className="bg-gray-950 size-fit h-full border-r border-gray-500/50 z-50 flex flex-col items-start  gap-5 py-4"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
        >
            {links.map((link) => link && (
                <Link to={link.url} onClick={() => setCurrentPage(link.url)} className='w-full' key={link.url}>

                    {
                        menuOpen ?
                            (
                                <Button
                                    variant="contained"
                                    size='small'
                                    className='w-full flex justify-start sidebar-open'
                                    startIcon={<link.icon fontSize='small' className='sidebar-icon' />}
                                    sx={{
                                        backgroundColor: current_page === link.url ? "oklch(0.278 0.033 256.847992)" : "transparent",
                                        width: 'calc(100% - 10px)',
                                        margin: "0 5px",
                                        display: "flex",
                                        justifyContent: "flex-start",
                                    }}
                                >{link.name}</Button>
                            )
                            :
                            (
                                <Button
                                    variant="contained"
                                    startIcon={<link.icon fontSize='small' />}
                                    size='small'
                                    sx={{
                                        backgroundColor: current_page === link.url ? "oklch(0.278 0.033 256.847992)" : "transparent",
                                        width: 'calc(100% - 10px)',
                                        margin: "0 5px",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                    className='w-full flex justify-start sidebar-closed'
                                >
                                    {menuOpen && link.name}
                                </Button>
                            )
                    }
                </Link>
            ))}
        </nav >
    );
}
