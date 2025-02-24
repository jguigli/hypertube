import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import User from "../types/User.tsx";
import { Button, Divider } from "@mui/material";
import Input from "../components/Input.tsx";
import { useNavigate } from "react-router-dom";
import GoogleIcon from '@mui/icons-material/Google';
import { Icon42 } from '../pages/Register.tsx';
import CustomCard from "../components/Card.tsx";

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

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            <div id="login" className="flex flex-col align-center space-y-5 gap-5">
                <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">Login</h1>
                        <h2 className="text-xl">Enter your credentials to login</h2>
                    </div>
                    <div className="flex gap-2 w-full items-center">
                        <p>Don't have an account?</p>
                        <Button variant="outlined" onClick={() => navigate("/register")}>Register</Button>
                    </div>
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
                    <div className="flex gap-5 w-full items-center">
                        <Button variant="contained" type="submit">Login</Button>
                    </div>
                    <div className="flex gap-2 w-full items-center">
                        <p>Forgot your password?</p>
                        <Button variant="outlined" onClick={() => navigate("/forgot-password")}>Reset password</Button>
                    </div>
                </form>
                <Divider className="w-full" />
                <div className="flex gap-3 w-full items-center">
                    <h2 className="text-xl"> Or login with:</h2>
                    <Button variant="outlined">
                        <span className="flex items-center gap-2">
                            <GoogleIcon color="secondary" />
                            Google
                        </span>
                    </Button>
                    <Button variant="outlined">
                        <span className="flex items-center gap-2">
                            <Icon42 />
                            42
                        </span>
                    </Button>
                </div>
            </div>
        </CustomCard>
    )
}
