import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
// import Button from "../components/Button";
// MUI Button
import Button from "@mui/material/Button";
import { Card, Checkbox, Divider, FormControlLabel } from "@mui/material";
import Input from "../components/Input";
import SvgIcon from '@mui/material/SvgIcon';
import GoogleIcon from '@mui/icons-material/Google';
import "../assets/42Icon.svg";
import CustomCard from "../components/Card";
import AuthService from "../services/AuthService";


function RegisterFormFirstPart(
    props: {
        username: string;
        setUsername: (username: string) => void;
        password: string;
        setPassword: (password: string) => void;
        passwordConfirmation: string;
        setPasswordConfirmation: (passwordConfirmation: string) => void;
        showPassword: boolean;
        setShowPassword: (showPassword: boolean) => void;
    }
) {

    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="username_register">Username</label>
                <Input
                    type="text"
                    placeholder="Username"
                    value={props.username}
                    onChange={(e) => props.setUsername(e.target.value)}
                    required
                    id="username_register"
                />
                <p className="text-xs">This is your public display name. It can be your real name or a pseudonym.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="password_register">Password</label>
                <Input
                    type={props.showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={props.password}
                    onChange={(e) => props.setPassword(e.target.value)}
                    required
                    id="password_register"
                />
                <p className="text-xs">Passwords must be at least 8 characters long.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="passwordConfirmation_register">Password Confirmation</label>
                <Input
                    type={props.showPassword ? "text" : "password"}
                    placeholder="Password Confirmation"
                    value={props.passwordConfirmation}
                    onChange={(e) => props.setPasswordConfirmation(e.target.value)}
                    required
                    id="passwordConfirmation_register"
                />
                {(props.password !== "" || props.passwordConfirmation !== "") && (
                    <FormControlLabel control={<Checkbox />} label="Show Password" onChange={
                        () => props.setShowPassword(!props.showPassword)
                    } />
                )}
            </div>
        </>
    );



}


function RegisterFormSecondPart(
    props: {
        email: string;
        setEmail: (email: string) => void;
        firstName: string;
        setFirstName: (firstName: string) => void;
        lastName: string;
        setLastName: (lastName: string) => void;
    }
) {
    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="email_register">Email</label>
                <Input
                    type="email"
                    placeholder="Email"
                    value={props.email}
                    onChange={(e) => props.setEmail(e.target.value)}
                    required
                    id="email_register"
                />
                <p className="text-xs">We'll never share your email with anyone else.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label htmlFor="firstName_register">First Name</label>
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
                <label htmlFor="lastName_register">Last Name</label>
                <Input
                    type="text"
                    placeholder="Last Name"
                    value={props.lastName}
                    onChange={(e) => props.setLastName(e.target.value)}
                    required
                    id="lastName_register"
                />
            </div>
        </>
    );
}

export function Icon42() {

    const color = "#fff";

    return (
        <SvgIcon>
            <svg width="57px" height="40px" viewBox="0 0 57 40" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>42 Final sigle seul</title>
                <defs>
                    <filter id="filter-1">
                        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 1.000000 0"></feColorMatrix>
                    </filter>
                    <polygon id="path-2" points="0 0.204536082 31.6266585 0.204536082 31.6266585 39.9752577 0 39.9752577"></polygon>
                </defs>
                <g id="Page-1" stroke="none" fill="none" >
                    <g id="Home-page" transform="translate(-20.000000, -119.000000)">
                        <g id="42-Final-sigle-seul" transform="translate(0.000000, 86.000000)" filter="url(#filter-1)">
                            <g transform="translate(20.000000, 33.000000)">
                                <g id="Group-3">
                                    <g id="Clip-2"></g>
                                    <polyline id="Fill-1" fill={color} mask="url(#mask-3)" points="31.6266585 0.204536082 21.0841616 0.204536082 0 21.0969072 0 29.5538144 21.0841616 29.5538144 21.0841616 40 31.6266585 40 31.6266585 21.0969072 10.5420808 21.0969072 31.6266585 0.204536082"></polyline>
                                </g>
                                <polyline id="Fill-4" fill={color} points="35.3488372 10.2325581 45.5813953 0 35.3488372 0 35.3488372 10.2325581"></polyline>
                                <polyline id="Fill-5" fill={color} points="56.744186 10.5424969 56.744186 0 46.5118299 0 46.5118299 10.5424969 36.2790698 21.0849939 36.2790698 31.627907 46.5118299 31.627907 46.5118299 21.0849939 56.744186 10.5424969"></polyline>
                                <polyline id="Fill-6" fill={color} points="56.744186 21.3953488 46.5116279 31.627907 56.744186 31.627907 56.744186 21.3953488"></polyline>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </SvgIcon>
    );
}

export default function Register() {

    // State pour les champs du formulaire
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [currentStep, setCurrentStep] = useState(1);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simuler la création d'un utilisateur (à remplacer par un appel API)
        const authService = new AuthService();
        const response = await authService.register(username, password, passwordConfirmation, email, firstName, lastName);

        if (!response.success) {
            alert("An error occurred");
            return;
        }

        login(response.user);
        navigate("/");
    };

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            <div id="register" className="flex flex-col align-center gap-2">
                <div>
                    <h1 className="text-2xl font-bold">Register</h1>
                    <h2 className="text-xl">Enter your details to create an account</h2>
                    <p className="text">Step {currentStep} of 2</p>
                    <div className="flex gap-2 w-full items-center">
                        <p>Already have an account?</p>
                        <Button variant="outlined" onClick={() => navigate("/login")}>Login</Button>
                    </div>
                </div>
                <Divider className="w-full" />
                <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5">
                    {currentStep === 1 ? (
                        <>
                            < RegisterFormFirstPart
                                username={username}
                                setUsername={setUsername}
                                password={password}
                                setPassword={setPassword}
                                passwordConfirmation={passwordConfirmation}
                                setPasswordConfirmation={setPasswordConfirmation}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                            <Button variant="outlined" onClick={() => setCurrentStep(2)}>Next</Button>
                        </>
                    ) : (
                        <>
                            <RegisterFormSecondPart
                                email={email}
                                setEmail={setEmail}
                                firstName={firstName}
                                setFirstName={setFirstName}
                                lastName={lastName}
                                setLastName={setLastName}
                            />
                            <div className="flex gap-3 w-full">
                                <Button variant="outlined" onClick={() => setCurrentStep(1)}>Previous</Button>
                                <Button variant="contained" type="submit">Register</Button>
                            </div>
                        </>
                    )}
                </form>
                <Divider className="w-full" />
                <div className="flex gap-2 w-full items-center">
                    <h2 className="text-xl"> Or register with:</h2>
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
    );
}
