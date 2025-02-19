import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { redirect } from "react-router-dom";
import User from "../types/User.tsx";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call to login
        setPassword("");
        setUsername("");
        // Simulation d'un utilisateur récupéré depuis l'API
        const fakeUser: User = {
            id: "1",
            username: "JohnDoe",
            email: "johndoe@example.com"
        };
        login(fakeUser);
        redirect("/");
    };


    return (
        <>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

            </form>
        </>
    )
}
