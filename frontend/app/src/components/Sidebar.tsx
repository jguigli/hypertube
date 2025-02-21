import "../styles/Sidebar.css";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function Sidebar(
    props: {
        open: boolean;
        toggle_menu: () => void;
    }
) {

    const { user } = useAuth();

    const links = [
        {
            name: "Home",
            url: "/",
            icon: HomeIcon,
        },

        // Add profile link to sidebar if user is logged in
        user ? {
            name: "Profile",
            url: `/profile/${user.username}`,
            icon: AccountCircleIcon
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
            className="bg-gray-950 p-4 size-fit h-full col-span-1 row-span-2 row-start-2 border-r border-gray-500/50 text-gray-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ul>
                {links.map((link) => link && (
                    <li key={link.name} className="flex items-center space-x-2 my-3">
                        <Link to={link.url} className="flex items-center space-x-2">
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
        </nav>
    );
}
