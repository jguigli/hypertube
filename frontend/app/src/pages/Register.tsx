import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


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
            <input
                type="text"
                placeholder="Username"
                value={props.username}
                onChange={(e) => props.setUsername(e.target.value)}
                required
            />
            <input
                type={props.showPassword ? "text" : "password"}
                placeholder="Password"
                value={props.password}
                onChange={(e) => props.setPassword(e.target.value)}
                required
            />
            <input
                type={props.showPassword ? "text" : "password"}
                placeholder="Password Confirmation"
                value={props.passwordConfirmation}
                onChange={(e) => props.setPasswordConfirmation(e.target.value)}
                required
            />
            <button
                type="button" onClick={() => props.setShowPassword(!props.showPassword)}
            >
                {props.showPassword ? "Hide" : "Show"}
            </button>
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
            <input
                type="email"
                placeholder="Email"
                value={props.email}
                onChange={(e) => props.setEmail(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="First Name"
                value={props.firstName}
                onChange={(e) => props.setFirstName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Last Name"
                value={props.lastName}
                onChange={(e) => props.setLastName(e.target.value)}
                required
            />
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
            return;
        }

        // Connecter immédiatement l'utilisateur après l'inscription
        login(newUser);
        navigate("/");
    };

    return (
        <>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
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
                        <button type="button" onClick={() => setCurrentStep(2)}>Next</button>
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
                        <button type="submit">Register</button>
                        <button type="button" onClick={() => setCurrentStep(1)}>Previous</button>

                    </>
                )}
            </form>

        </>
    );
}
