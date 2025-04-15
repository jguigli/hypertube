import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, InputLabel, Stack, Typography } from "@mui/material";
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
import { GitHub } from "@mui/icons-material";
import { useTranslation } from 'react-i18next';


export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const userService = new UserService();
    const { setActiveLink} = useActiveLink();
    const { t } = useTranslation();

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
                setError(t("An unexpected error occurred, please try again later"));
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
                setError(t("An unexpected error occurred, please try again later"));
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
            alert(t("An error occurred while getting the user's avatar") + avatarResponse.error || t("An unexpected error occurred"));
        }

        login(newUser, token);

        setPassword("");
        setUsername("");
        setError("");

        setActiveLink("/");
        navigate("/");

    };

    const loginService = new LoginService();

    const handle42Login = async () => {
        loginService.registerOAuth("42");
    };

    const handleGoogleLogin = async () => {
        loginService.registerOAuth("google");
    }

    const handleGithubLogin = async () => {
        loginService.registerOAuth("github");
    }

    // UseEffect to detect if there is an error in the URL
    // If there is an error, display it
    // If there is no error, do nothing
    const [errorInUrl, setErrorInUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        const error = url.searchParams.get("error");
        if (error) {
            const decodedError = atob(error);
            setErrorInUrl(decodedError);
        }
    }, []);


    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] p-5">
            <div id="login" className="flex flex-col align-center space-y-2 gap-2">
                <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2">
                    <Typography variant="h4" className="font-bold text-center w-full">
                        {t("Login")}
                    </Typography>
                    <Separator text={t("Enter your credentials to login")} />
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="username_register">{t("Username")}</InputLabel>
                        <Input
                            type="text"
                            placeholder={t("Username")}
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            id="username_register"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="password_register">{t("Password")}</InputLabel>
                        <PasswordInput placeholder={t("Password")} value={password} onChange={handlePasswordChange} required id="password_register" />
                    </div>
                    {error && <Typography variant="body1" color="error">{error}</Typography>}
                    <div className="flex gap-5 w-full items-center ">
                        <Button variant="contained" className="w-full" type="submit">{t("Login")}</Button>
                    </div>
                    <div className="flex gap-2 w-full items-center">
                        <Typography variant="body1" color="primary" onClick={() => navigate("/forgot-password")} className="cursor-pointer">{t("Forgot password?")}</Typography>
                    </div>
                </form>
                <>
                    <Separator text={t('Or login with:')} />
                    <Stack direction="column" spacing={2} className="w-full">
                        <Button variant="outlined"
                            onClick={handle42Login}
                        >
                            <span className="flex items-center gap-2">
                                <Icon42 /> 42
                            </span>
                        </Button>
                        <Button variant="outlined" onClick={handleGoogleLogin}>
                            <span className="flex items-center gap-2">
                                <GoogleIcon color="secondary" /> Google
                            </span>
                        </Button>
                        <Button variant="outlined" onClick={handleGithubLogin}>
                            <span className="flex items-center gap-2">
                                <GitHub color="secondary" /> Github
                            </span>
                        </Button>
                        <Typography variant="body1" color="error">{errorInUrl}</Typography>
                    </Stack>
                </>
                <>
                    <Separator text={t("Don't have an account?")} />
                    <Link to="/register" onClick={() => setActiveLink("/register")} className="w-full">
                        <Button variant="text" className="w-full">{t("Register")}</Button>
                    </Link>
                </>
            </div>
        </CustomCard>
    )
}
