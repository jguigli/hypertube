import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Input, { PasswordInput } from "../components/Input";
import { Button, InputLabel, Typography } from "@mui/material";
import CustomCard from "../components/Card";
import LoginService from "../services/LoginService";
import { useActiveLink } from "../contexts/ActiveLinkContext";


export default function ResetPassword() {


    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [error, setError] = useState("");


    async function sendResetEmail(event: React.FormEvent) {

        // POST localhost:8000/reset_password

        event.preventDefault();
        const loginService = new LoginService();
        const response = await loginService.resetPassword(email);
        if (response.success) {
            setError("");
            setResponseMessage("An email with a link to reset your password has been sent.");
        } else {
            if (response.error) {
                setError(response.error.message);
            } else {
                setError("An unexpected error occurred.");
            }
            setResponseMessage("");
        }
    }


    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.target.value);
        setError("");
        setResponseMessage("");
    }


    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] p-5">
            <div className="flex flex-col items-start gap-5 ">
                <Typography variant="h4" className="font-bold text-center w-full">
                    Reset your password
                </Typography>
                <Typography variant="body1" className="text-center w-full">
                    Enter your email address and we will send you a link to reset your password.
                </Typography>
                <form onSubmit={sendResetEmail} className="flex flex-col items-start gap-2 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="email_reset_password">Email</InputLabel>
                        <Input
                            type="text"
                            placeholder="Email associated with your account"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            id="email_reset_password"
                        />
                    </div>
                    <div className="flex gap-5 w-full items-center ">
                        <Button variant="contained" className="w-full" type="submit">Send me a mail</Button>
                    </div>
                </form>
                {responseMessage && <Typography variant="caption" className="text-center">{responseMessage}</Typography>}
                {error && <Typography variant="caption" className="text-center text-red-500">{error}</Typography>}
                <Typography variant="body1" color="primary" onClick={() => navigate("/login")} className="cursor-pointer">
                    Back to login
                </Typography>
            </div >
        </CustomCard>
    )
}


export function ChangePassword() {

    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const access_token = urlParams.get('access_token');
    const token_type = urlParams.get('token_type');
    const context = urlParams.get('context');

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const { setActiveLink } = useActiveLink();

    if (!access_token || !token_type || context !== 'reset_password') {
        setActiveLink("/login")
        navigate("/login");
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>, type: "password" | "passwordConfirmation") {
        setPasswordError("");
        if (type === "password") {
            setNewPassword(event.target.value);
        } else {
            setConfirmPassword(event.target.value);
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        // Check if the passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        // Send the new password to the server
        const loginService = new LoginService();
        const authToken = `${token_type} ${access_token}`;
        const response = await loginService.changePassword(newPassword, confirmPassword, authToken);

        if (response.success) {
            setError("");
            setSuccess(true);
        } else if (response.error) {
            setError(response.error);
        }
    }

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] p-5">
            <div className="flex flex-col items-start gap-5 ">

                <Typography variant="h4" className="font-bold text-center w-full">
                    Reset your password
                </Typography>
                <Typography variant="body1" className="text-center w-full">
                    Enter your new password below.
                </Typography>
                <form onSubmit={handleSubmit} className="flex flex-col items-start gap-2 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="password_register">Your new password</InputLabel>
                        <PasswordInput placeholder="Password" value={newPassword} onChange={(e) => handlePasswordChange(e, "password")} required id="password_register" autocomplete="new-password" />
                        <Typography variant="caption" className="text-xs" color="textSecondary">Passwords must be at least 8 characters long.</Typography>
                        {passwordError && <Typography variant="caption" className="text-xs text-red-500">{passwordError}</Typography>}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <InputLabel htmlFor="password_confirmation_register">Password confirmation</InputLabel>
                        <PasswordInput placeholder="Password confirmation" value={confirmPassword} onChange={(e) => handlePasswordChange(e, "passwordConfirmation")} required id="password_confirmation_register" autocomplete="new-password" />
                    </div>
                    {success && <Typography variant="caption" >Password changed successfully, you can now <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/login")}>login</span>.
                    </Typography>}
                    {error && <Typography variant="caption" className="text-xs text-red-500">{error}</Typography>}
                    <div className="flex gap-5 w-full items-center ">
                        <Button variant="contained" className="w-full" type="submit">
                            Reset password
                        </Button>
                        <Button variant="outlined" className="w-full" onClick={() => navigate("/login")}>
                            Back to login
                        </Button>
                    </div>
                </form>
            </div>
        </CustomCard>
    );

}