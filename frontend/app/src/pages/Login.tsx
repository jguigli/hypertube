import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, InputLabel, Typography } from "@mui/material";
import Input, { PasswordInput } from "../components/Input.tsx";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from '@mui/icons-material/Google';
import CustomCard from "../components/Card.tsx";
import Icon42 from "../utils/Icon42.tsx";
import { Separator } from "./Register.tsx";
import LoginService from "../services/LoginService.tsx";
import UserService from "../services/UserService.tsx";
import User from "../types/User.tsx";
import { useActiveLink } from "../contexts/ActiveLinkContext.tsx";

export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { user, login } = useAuth();
    const navigate = useNavigate();
    const userService = new UserService();

    const { setActiveLink} = useActiveLink();

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

        const loginService = new LoginService();
        const response = await loginService.login(username, password);

        // Check if the request was successful
        if (!response.success || !response.token) {
            if (response.error) {
                setError(response.error);
            } else {
                setError("An unexpected error occurred, please try again later");
            }
            return;
        }

        const token = response.token;

        // GET api/auth/me -> Get the user
        const userResponse = await userService.getMe(token);

        // Check if the request was successful
        if (!userResponse.success || !userResponse.user) {
            if (userResponse.error) {
                setError(userResponse.error);
            } else {
                setError("An unexpected error occurred, please try again later");
            }
            return;
        }

        let newUser: User = {
            email: userResponse.user.email,
            username: userResponse.user.username,
            firstName: userResponse.user.firstName,
            lastName: userResponse.user.lastName,
            language: user.language,
            is_logged_in: true,
        }

        // Get the user's avatar
        const avatarResponse = await userService.getPicture(token);
        if (avatarResponse.success && avatarResponse.avatar) {
            newUser.avatar = avatarResponse.avatar;
        } else {
            alert("An error occurred while getting the user's avatar" + avatarResponse.error || "An unexpected error occurred");
        }

        login(newUser, token);

        setPassword("");
        setUsername("");
        setError("");

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
                    <Link to="/register" onClick={() => setActiveLink("/register")} className="w-full">
                        <Button variant="text" className="w-full">Register</Button>
                    </Link>
                </>
            </div>
        </CustomCard>
    )
}
