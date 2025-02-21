import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import User from "../types/User.tsx";
import { Button } from "@mui/material";
import Input from "../components/Input.tsx";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();

    const navigate = useNavigate();

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
        navigate("/");
    };

    // {% for field in form %}
    // <div class="form-group">
    //     <label for="{{ field.id_for_label }}">{{ field.label }}</label>
    //     <input type="{{ field.field.widget.input_type }}" id="{{ field.id_for_label }}" name="{{ field.html_name }}" required class="form-control">
    //         {% if field.help_text %}
    //         <small class="form-text text-muted">{{ field.help_text }}</small>
    //         {% endif %}
    // </div>
    // {% endfor %}

    return (
        <div id="login" className="flex flex-col align-center w-[500px]">

            <div>
                <h1 className="text-2xl font-bold">Login</h1>
                <h2 className="text-xl">Enter your credentials to login</h2>
            </div>

            <br />
            <hr />
            <br />

            <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5">

                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="username_login">Username</label>
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        id="username_login"
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="password_login">Password</label>
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        id="password_login"
                    />
                </div>

                <Button variant="contained" type="submit">Login</Button>

            </form>
        </div>
    )
}
