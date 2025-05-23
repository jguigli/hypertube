import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Divider, InputLabel, Stack, Typography } from "@mui/material";
import Input, { FileInput, PasswordInput } from "../components/Input";
import GoogleIcon from '@mui/icons-material/Google';
import "../assets/42Icon.svg";
import CustomCard from "../components/Card";
import Icon42 from "../utils/Icon42";
import LoginService from "../services/LoginService";
import UserService from "../services/UserService";
import User from "../types/User";
import { useAuth } from "../contexts/AuthContext";
import { useActiveLink } from "../contexts/ActiveLinkContext";
import { GitHub } from "@mui/icons-material";
import { useTranslation } from 'react-i18next';


function RegisterFormFirstPart(
    props: {
        username: string;
        setUsername: (username: string) => void;
        usernameError: string | null;
        setUsernameError: (usernameError: string | null) => void;
        password: string;
        setPassword: (password: string) => void;
        passwordConfirmation: string;
        setPasswordConfirmation: (passwordConfirmation: string) => void;
        showPassword: boolean;
        setShowPassword: (showPassword: boolean) => void;
        passwordError: string | null;
        setPasswordError: (passwordError: string | null) => void;
        passwordFormatError: string | null;
        setPasswordFormatError: (passwordFormatError: string | null) => void;
    }
) {

    const { t } = useTranslation();

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>, type: "password" | "passwordConfirmation") {
        event.preventDefault();
        if (type === "password") {
            props.setPassword(event.target.value);
        } else {
            props.setPasswordConfirmation(event.target.value);
        }
        if (props.passwordError) {
            props.setPasswordError(null);
        }
        if (props.passwordFormatError) {
            props.setPasswordFormatError(null);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="username_register">{t("Username")}</InputLabel>
                <Input
                    type="text"
                    placeholder={t("Username")}
                    value={props.username}
                    onChange={(e) => props.setUsername(e.target.value)}
                    required
                    id="username_register"
                    autocomplete="new-username"
                />
                {props.usernameError && <Typography variant="caption" className="text-xs text-red-500">{props.usernameError}</Typography>}
                <Typography variant="caption" className="text-xs" color="textSecondary">{t("This is your public display name. It can be your real name or a pseudonym.")}</Typography>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="password_register">{t("Password")}</InputLabel>
                <PasswordInput placeholder={t("Password")} value={props.password} onChange={(e) => handlePasswordChange(e, "password")} required id="password_register" autocomplete="new-password" />
                {
                    !props.passwordFormatError && (
                        <Typography variant="caption" className="text-xs" color="textSecondary">
                            {t("Passwords must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit and one special character.")}
                        </Typography>
                    )
                }
                {props.passwordError && <Typography variant="caption" className="text-xs text-red-500">{props.passwordError}</Typography>}
                {props.passwordFormatError && <Typography variant="caption" className="text-xs text-red-500">{props.passwordFormatError}</Typography>}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="password_confirmation_register">{t("Password confirmation")}</InputLabel>
                <PasswordInput placeholder={t("Please confirm your password")} value={props.passwordConfirmation} onChange={(e) => handlePasswordChange(e, "passwordConfirmation")} required id="password_confirmation_register" autocomplete="new-password" />
            </div>
        </>
    );
}

function RegisterFormSecondPart(
    props: {
        email: string;
        setEmail: (email: string) => void;
        emailError: string | null;
        setEmailError: (emailError: string | null) => void;
        emailFormatError: string | null;
        setEmailFormatError: (emailFormatError: string | null) => void;
        firstName: string;
        setFirstName: (firstName: string) => void;
        lastName: string;
        setLastName: (lastName: string) => void;
        avatar: File | null;
        setAvatar: (avatar: File | null) => void;
        firstNameError: string | null;
        setFirstNameError: (firstNameError: string | null) => void;
        lastNameError: string | null;
        setLastNameError: (lastNameError: string | null) => void;
    }
) {

    const { t } = useTranslation();

    const handleAvatarChange = (file: File | null) => {
        props.setAvatar(file);
    };

    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="email_register">{t("Email")}</InputLabel>
                <Input
                    type="email"
                    placeholder={t("Email")}
                    value={props.email}
                    onChange={(e) => props.setEmail(e.target.value)}
                    required
                    id="email_register"
                />
                {props.emailError && <Typography variant="caption" className="text-xs text-red-500">{props.emailError}</Typography>}
                {props.emailFormatError && <Typography variant="caption" className="text-xs text-red-500">{props.emailFormatError}</Typography>}
                <Typography variant="caption" className="text-xs" color="textSecondary">{t("We'll never share your email with anyone else.")}</Typography>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="firstName_register">{t("First Name")}</InputLabel>
                <Input
                    type="text"
                    placeholder={t("First Name")}
                    value={props.firstName}
                    onChange={(e) => props.setFirstName(e.target.value)}
                    required
                    id="firstName_register"
                />
                {props.firstNameError && <Typography variant="caption" className="text-xs text-red-500">{props.firstNameError}</Typography>}
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="lastName_register">{t("Last Name")}</InputLabel>
                <Input
                    type="text"
                    placeholder={t("Last Name")}
                    value={props.lastName}
                    onChange={(e) => props.setLastName(e.target.value)}
                    required
                    id="lastName_register"
                />
                {props.lastNameError && <Typography variant="caption" className="text-xs text-red-500">{props.lastNameError}</Typography>}
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="avatar_register">{t("Avatar")}</InputLabel>
                <FileInput
                    file={props.avatar}
                    onChange={handleAvatarChange}
                />
                <Typography variant="caption" className="text-xs" color="textSecondary">{t("This is your public display picture. It can be a photo of you or an avatar.")}</Typography>
            </div>
        </>
    );
}

export function Separator(
    props: {
        text: string;
    }
) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2 w-full mb-2 mt-2">
            <Divider className="flex-1" />
            <Typography variant="h6" color="textSecondary">{t(props.text)}</Typography>
            <Divider className="flex-1" />
        </div>
    );
}

export default function Register() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailFormatError, setEmailFormatError] = useState<string | null>(null);
    const [passwordFormatError, setPasswordFormatError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);

    const { user, login } = useAuth();
    const navigate = useNavigate();

    const userService = new UserService();
    const loginService = new LoginService();

    const { setActiveLink } = useActiveLink();

    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setPasswordError("Password and password confirmation do not match.");
            setCurrentStep(1);
            return;
        }

        const response = await userService.register(
            username,
            password,
            email,
            firstName,
            lastName,
        );

        if (!response.success || !response.token) {

            if (response.error === "Username already taken") {
                setUsernameError(t("Username already taken"));
                setCurrentStep(1);
                return;
            } else {
                setUsernameError(null);
            }

            if (response.error === "Email already registered") {
                setEmailError(t("Email already registered"));
                setCurrentStep(2);
                return;
            } else {
                setEmailError(null);
            }

            if (response.error === "Invalid email format") {
                setEmailFormatError(t("Invalid email format"));
                setCurrentStep(2);
                return;
            } else {
                setEmailFormatError(null);
            }

            if (response.error === "The new password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character") {
                setPasswordFormatError(t("The password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character"));
                setCurrentStep(1);
                return;
            } else {
                setPasswordFormatError(null);
            }

            if (response.error === "First name cannot be empty.") {
                setFirstNameError(t("First name cannot be empty."));
                setCurrentStep(2);
                return;
            } else {
                setFirstNameError(null);
            }

            if (response.error === "Last name cannot be empty.") {
                setLastNameError(t("Last name cannot be empty."));
                setCurrentStep(2);
                return;
            } else {
                setLastNameError(null);
            }

            alert(t("An error occurred") + ": " + response.error || t("An unexpected error occurred"));
            return;
        }

        const token = response.token;

        const userResponse = await userService.getMe(token);

        if (!userResponse.success || !userResponse.user) {
            alert(t("An error occurred") + ": " + userResponse.error ||  t("An unexpected error occurred"));
            return;
        }

        let newUser: User = {
            id: userResponse.user.id,
            email: userResponse.user.email,
            username: userResponse.user.username,
            firstName: userResponse.user.firstName,
            lastName: userResponse.user.lastName,
            language: user.language,
            is_logged_in: true,
        }

        if (avatar) {
            const avatarResponse = await userService.setPicture(token, avatar);
            if (avatarResponse.success) {
                newUser.avatar = avatarResponse.avatar as string;
            }
        } else {
            const avatarResponse = await userService.getPicture(token);
            if (avatarResponse.success) {
                newUser.avatar = avatarResponse.avatar as string;
            }
        }

        login(newUser, token);

        setPassword("");
        setUsername("");
        setPasswordConfirmation("");
        setEmail("");
        setFirstName("");
        setLastName("");
        setAvatar(null);

        setActiveLink("/");
        navigate("/");
    };

    const handle42Register = async () => {
        loginService.registerOAuth("42");
    };

    const handleGoogleRegister = async () => {
        loginService.registerOAuth("google");
    };

    const handleGithubLogin = async () => {
        loginService.registerOAuth("github");
    };

    function handleNextPage(event: React.MouseEvent) {
        event.preventDefault();

        if (password !== passwordConfirmation) {
            setPasswordError(t("Passwords and password confirmation do not match."));
            return;
        }
        setCurrentStep(2);
    }

    return (
        <CustomCard additionalClasses="flex flex-col align-center md:w-[500px] p-5">
            <div id="register" className="flex flex-col align-center gap-2"></div>
            <Typography variant="h4" className="font-bold text-center mb-5">
                {t("Register")}
            </Typography>
            {currentStep === 1 && (
                <>
                    <Separator text={t("With an existing account:")} />
                    <Stack direction="column" spacing={2} className="w-full">
                        <Button variant="outlined"
                            onClick={handle42Register}
                        >
                            <span className="flex items-center gap-2">
                                <Icon42 /> 42
                            </span>
                        </Button>
                        <Button variant="outlined" onClick={handleGoogleRegister}>
                            <span className="flex items-center gap-2">
                                <GoogleIcon color="secondary" /> Google
                            </span>
                        </Button>
                        <Button variant="outlined" onClick={handleGithubLogin}>
                            <span className="flex items-center gap-2">
                                <GitHub color="secondary" /> Github
                            </span>
                        </Button>
                    </Stack>
                </>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5 my-3">
                {currentStep === 1 ? (
                    <>
                        <Separator text={t("Or with a new account:")} />
                        <RegisterFormFirstPart
                            username={username}
                            setUsername={setUsername}
                            usernameError={usernameError}
                            setUsernameError={setUsernameError}
                            password={password}
                            setPassword={setPassword}
                            passwordFormatError={passwordFormatError}
                            setPasswordFormatError={setPasswordFormatError}
                            passwordConfirmation={passwordConfirmation}
                            setPasswordConfirmation={setPasswordConfirmation}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            passwordError={passwordError}
                            setPasswordError={setPasswordError}
                        />
                        <Button variant="contained" onClick={handleNextPage} className="w-full">{t("Next")}</Button>
                    </>
                ) : (
                    <>
                        <RegisterFormSecondPart
                            email={email}
                            setEmail={setEmail}
                            emailError={emailError}
                            setEmailError={setEmailError}
                            emailFormatError={emailFormatError}
                            setEmailFormatError={setEmailFormatError}
                            firstName={firstName}
                            setFirstName={setFirstName}
                            lastName={lastName}
                            setLastName={setLastName}
                            avatar={avatar}
                            setAvatar={setAvatar}
                            firstNameError={firstNameError}
                            setFirstNameError={setFirstNameError}
                            lastNameError={lastNameError}
                            setLastNameError={setLastNameError}
                        />
                        <div className="flex gap-3 w-full">
                            <Button variant="outlined" onClick={() => setCurrentStep(1)} className="flex-1">{t("Previous")}</Button>
                            <Button variant="contained" type="submit" className="flex-1">{t("Register")}</Button>
                        </div>
                    </>
                )}
            </form>
            {currentStep === 1 && (
                <>
                    <Separator text={t("Already have an account?")} />
                    <Link to="/login" onClick={() => setActiveLink("/login")} className="w-full">
                        <Button variant="text" className="w-full">{t("Login")}</Button>
                    </Link>
                </>
            )}
        </CustomCard>
    );
}
