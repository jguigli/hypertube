import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import menu_toggle from "../assets/menu_icon.svg";


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
            <h1>Hypertube</h1>
        </Link>
    );
}

function SearchBar() {
    return (
        <input type="text" id="search-bar" className="bg-gray-50 text-gray-800 px-3 rounded-full flex-auto max-w-100" placeholder="Search..." />
    );
}

function UserProfile() {
    const { user, logout } = useAuth();

    return (
        <>
            {user != null ? (
                <div id="user-profile" className="flex flex-row items-center gap-2">
                    <p>{user.username}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div id="user-profile" className="flex flex-row items-center gap-2">
                    <button id="login-button">
                        <Link to="/login">Login</Link>
                    </button>
                    <button id="register-button">
                        <Link to="/register">Register</Link>
                    </button>
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
            className="flex flex-row justify-between items-center max-h-[50px] p-3 bg-gray-800 text-white sticky top-0 z-50 col-span-2 row-span-1"
        >
            <div className="flex flex-row items-center gap-2">
                <ToggleSidebar toggle_menu={props.toggle_menu} />
                <Logo />
            </div>
            <SearchBar />
            <UserProfile />
        </nav>
    );
}
