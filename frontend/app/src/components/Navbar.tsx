import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import menu_toggle from "../assets/menu_icon.svg";

function ToggleSidebar() {


    return (
        <img className="max-h-9" src={menu_toggle} alt="menu" />
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
        <input type="text" id="search-bar" className="bg-gray-50 text-gray-800 px-3 rounded-full" placeholder="Search..." />
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
                <button id="login-button">
                    <Link to="/login">Login</Link>
                </button>
            )}
        </>
    );
}

export default function Navbar() {
    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center  max-h-[50px] p-3 bg-gray-800 text-white"

        >
            <span className="flex flex-row items-center gap-2">
                <ToggleSidebar />
                <Logo />
            </span>
            <SearchBar />
            <UserProfile />
        </nav>
    );
}
