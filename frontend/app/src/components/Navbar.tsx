import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {user ? (
                    <li>
                        <span>Welcome, {user.username}!</span>
                        <button onClick={logout}>Logout</button>
                    </li>
                ) : (
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                    </>
                )}
                <li>
                    <Link to="/video">Video</Link>

                </li>
            </ul>
        </nav>
    );
}
