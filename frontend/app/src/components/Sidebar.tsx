import "../styles/Sidebar.css";

import LiveTvIcon from '@mui/icons-material/LiveTv';
import SvgIcon from '@mui/material/SvgIcon';
import { Link } from "react-router-dom";

function Icon(props: any) {
    return (
        <SvgIcon color="primary">
            <use xlinkHref={props.url} />
        </SvgIcon>
    );
}


export default function Sidebar(
    props: {
        open: boolean;
        toggle_menu: () => void;
    }
) {

    const links = [
        {
            name: "Home",
            url: "/",
            icon: LiveTvIcon,
        },
        {
            name: "Movies",
            url: "/movies",
            icon: LiveTvIcon,
        },
        {
            name: "Series",
            url: "/series",
            icon: LiveTvIcon
        },
        {
            name: "Profile",
            url: "/profile",
            icon: LiveTvIcon
        },
    ];

    return (
        <nav id="sidebar" className="bg-gray-400 p-4 h-full col-span-1 row-span-2 row-start-2" >
            <ul>
                {links.map((link) => (
                    <li key={link.name} className="flex items-center space-x-2">
                        <Link to={link.url} className="flex items-center space-x-2">
                            <link.icon color="primary" />
                            {props.open && (link.name)}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
