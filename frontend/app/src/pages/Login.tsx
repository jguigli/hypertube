import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import User from "../types/User.tsx";
import { Button, Divider, InputLabel, Typography } from "@mui/material";
import Input, { PasswordInput } from "../components/Input.tsx";
import { useNavigate } from "react-router-dom";
import GoogleIcon from '@mui/icons-material/Google';
import CustomCard from "../components/Card.tsx";
import Icon42 from "../utils/Icon42.tsx";
import { Separator } from "./Register.tsx";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(username, password);
        setPassword("");
        setUsername("");
        navigate("/");
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
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            id="username_register"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="password_register">Password</InputLabel>
                        <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required id="password_register" />
                    </div>
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
                    <Button variant="outlined" onClick={() => navigate("/register")}>Register</Button>
                </>
            </div>
        </CustomCard>
    )
}
