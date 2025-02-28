import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, InputLabel, Typography } from "@mui/material";
import Input, { PasswordInput } from "../components/Input.tsx";
import { useNavigate } from "react-router-dom";
import GoogleIcon from '@mui/icons-material/Google';
import CustomCard from "../components/Card.tsx";
import Icon42 from "../utils/Icon42.tsx";
import { Separator } from "./Register.tsx";
import AuthService from "../services/AuthService.tsx";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { user, login } = useAuth();
    const navigate = useNavigate();


    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        setError("");
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const authService = new AuthService();
        const response = await authService.login(username, password, user.language);

        if (response.success && response.user && response.token) {
            login(response.user, response.token);
            setPassword("");
            setUsername("");
            setError("");
            navigate("/");
        } else {
            const errorMessage = response.error?.message || "Login failed. Please try again.";
            setError(errorMessage);
        }
    };

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] p-5">
            <div id="login" className="flex flex-col align-center space-y-2 gap-2">
                <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2">
                    <Typography variant="h4" className="font-bold text-center w-full">
                        Login
                    </Typography>
                    <Separator text='Enter your credentials to login' />
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="username_register">Username</InputLabel>
                        <Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            id="username_register"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="password_register">Password</InputLabel>
                        <PasswordInput placeholder="Password" value={password} onChange={handlePasswordChange} required id="password_register" />
                    </div>
                    {error && <Typography variant="body1" color="error">{error}</Typography>}
                    <div className="flex gap-5 w-full items-center ">
                        <Button variant="contained" className="w-full" type="submit">Login</Button>
                    </div>
                    <div className="flex gap-2 w-full items-center">
                        <Typography variant="body1" color="primary" onClick={() => navigate("/forgot-password")} className="cursor-pointer">Forgot password?</Typography>
                    </div>
                </form>
                <>
                    <Separator text='Or login with:' />
                    <Button variant="outlined">
                        <span className="flex items-center gap-2">
                            <Icon42 />
                            42
                        </span>
                    </Button>
                    <Button variant="outlined">
                        <span className="flex items-center gap-2">
                            <GoogleIcon color="secondary" />
                            Google
                        </span>
                    </Button>
                </>
                <>
                    <Separator text="Don't have an account?" />
                    <Button variant="text" onClick={() => navigate("/register")}>Register</Button>
                </>
            </div>
        </CustomCard>
    )
}
