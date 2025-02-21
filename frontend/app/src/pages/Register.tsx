import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
// import Button from "../components/Button";
// MUI Button
import Button from "@mui/material/Button";
import { Checkbox, FormControlLabel } from "@mui/material";
import Input from "../components/Input";



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
                <FormControlLabel control={<Checkbox />} label="Show Password" onChange={
                    () => props.setShowPassword(!props.showPassword)
                } />

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simuler la création d'un utilisateur (à remplacer par un appel API)
        const newUser = { id: Date.now().toString(), username, email };

        if (password !== passwordConfirmation) {
            alert("Passwords do not match");
            setCurrentStep(1);
            return;
        }

        // Connecter immédiatement l'utilisateur après l'inscription
        login(newUser);
        navigate("/");
    };

    return (
        <div id="register" className="flex flex-col align-center w-[500px]">

            <div>
                <h1 className="text-2xl font-bold">Register</h1>
                <h2 className="text-xl">Enter your details to create an account</h2>
                <p className="text">Step {currentStep} of 2</p>
            </div>

            <br />
            <hr />
            <br />

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
                        <div className="flex gap-2 w-full">
                            <Button variant="outlined" onClick={() => setCurrentStep(1)}>Previous</Button>
                            <Button variant="contained" type="submit">Register</Button>
                            {/* <Button text="Previous" onClick={() => setCurrentStep(1)} /> */}
                            {/* <Button text="Register" type="submit" onClick={() => {}} /> */}
                        </div>

                    </>
                )}
            </form>

        </div>
    );
}
