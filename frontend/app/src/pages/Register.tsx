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
                <InputLabel htmlFor="username_register">Username</InputLabel>
                <Input
                    type="text"
                    placeholder="Username"
                    value={props.username}
                    onChange={(e) => props.setUsername(e.target.value)}
                    required
                    id="username_register"
                    autocomplete="new-username"
                />
                {props.usernameError && <Typography variant="caption" className="text-xs text-red-500">{props.usernameError}</Typography>}
                <Typography variant="caption" className="text-xs" color="textSecondary">This is your public display name. It can be your real name or a pseudonym.</Typography>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="password_register">Password</InputLabel>
                <PasswordInput placeholder="Password" value={props.password} onChange={(e) => handlePasswordChange(e, "password")} required id="password_register" autocomplete="new-password" />
                {
                    !props.passwordFormatError && (
                        <Typography variant="caption" className="text-xs" color="textSecondary">
                            Passwords must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit and one special character.
                        </Typography>
                    )
                }
                {props.passwordError && <Typography variant="caption" className="text-xs text-red-500">{props.passwordError}</Typography>}
                {props.passwordFormatError && <Typography variant="caption" className="text-xs text-red-500">{props.passwordFormatError}</Typography>}
            </div>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="password_confirmation_register">Password confirmation</InputLabel>
                <PasswordInput placeholder="Password confirmation" value={props.passwordConfirmation} onChange={(e) => handlePasswordChange(e, "passwordConfirmation")} required id="password_confirmation_register" autocomplete="new-password" />
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
    }
) {

    const handleAvatarChange = (file: File | null) => {
        props.setAvatar(file);
    };

    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="email_register">Email</InputLabel>
                <Input
                    type="email"
                    placeholder="Email"
                    value={props.email}
                    onChange={(e) => props.setEmail(e.target.value)}
                    required
                    id="email_register"
                />
                {props.emailError && <Typography variant="caption" className="text-xs text-red-500">{props.emailError}</Typography>}
                {props.emailFormatError && <Typography variant="caption" className="text-xs text-red-500">{props.emailFormatError}</Typography>}
                <Typography variant="caption" className="text-xs" color="textSecondary">We'll never share your email with anyone else.</Typography>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="firstName_register">First Name</InputLabel>
                <Input
                    type="text"
                    placeholder="First Name"
                    value={props.firstName}
                    onChange={(e) => props.setFirstName(e.target.value)}
                    required
                    id="firstName_register"
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="lastName_register">Last Name</InputLabel>
                <Input
                    type="text"
                    placeholder="Last Name"
                    value={props.lastName}
                    onChange={(e) => props.setLastName(e.target.value)}
                    required
                    id="lastName_register"
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <InputLabel htmlFor="avatar_register">Avatar</InputLabel>
                <FileInput
                    file={props.avatar}
                    onChange={handleAvatarChange}
                />
                <Typography variant="caption" className="text-xs" color="textSecondary">This is your public display picture. It can be a photo of you or an avatar.</Typography>
            </div>
        </>
    );
}

export function Separator(
    props: {
        text: string;
    }
) {
    return (
        <div className="flex items-center gap-2 w-full">
            <Divider className="flex-1" />
            <Typography variant="h6" color="textSecondary">{props.text}</Typography>
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

    const { user, login } = useAuth();
    const navigate = useNavigate();

    const userService = new UserService();
    const loginService = new LoginService();

    const { setActiveLink } = useActiveLink();

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
                setUsernameError("Username already taken");
                setCurrentStep(1);
                return;
            } else {
                setUsernameError(null);
            }

            if (response.error === "Email already registered") {
                setEmailError("Email already registered");
                setCurrentStep(2);
                return;
            } else {
                setEmailError(null);
            }

            if (response.error === "Invalid email format") {
                setEmailFormatError("Invalid email format");
                setCurrentStep(2);
                return;
            } else {
                setEmailFormatError(null);
            }

            if (response.error === "The new password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character") {
                setPasswordFormatError("The password must contain 8 characters with at least one lowercase, one uppercase, one digit and one special character");
                setCurrentStep(1);
                return;
            } else {
                setPasswordFormatError(null);
            }

            alert("An error occurred: " + response.error || "An unexpected error occurred");
            return;
        }

        const token = response.token;

        const userResponse = await userService.getMe(token);

        if (!userResponse.success || !userResponse.user) {
            alert("An error occurred: " + userResponse.error || "An unexpected error occurred");
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

    function handleNextPage(event: React.MouseEvent) {
        event.preventDefault();

        if (password !== passwordConfirmation) {
            setPasswordError("Passwords and password confirmation do not match.");
            return;
        }
        setCurrentStep(2);
    }

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            <div id="register" className="flex flex-col align-center gap-2"></div>
            <Typography variant="h4" className="font-bold text-center">
                Register
            </Typography>
            {currentStep === 1 && (
                <>
                    <Separator text='With an existing account:' />
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
                    </Stack>
                </>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5 my-3">
                {currentStep === 1 ? (
                    <>
                        <Separator text='Or with a new account:' />
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
                        <Button variant="contained" onClick={handleNextPage} className="w-full">Next</Button>
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
                        />
                        <div className="flex gap-3 w-full">
                            <Button variant="outlined" onClick={() => setCurrentStep(1)} className="flex-1">Previous</Button>
                            <Button variant="contained" type="submit" className="flex-1">Register</Button>
                        </div>
                    </>
                )}
            </form>
            {currentStep === 1 && (
                <>
                    <Separator text='Already have an account?' />
                    <Link to="/login" onClick={() => setActiveLink("/login")} className="w-full">
                        <Button variant="text" className="w-full">Login</Button>
                    </Link>
                </>
            )}
        </CustomCard>
    );
}
