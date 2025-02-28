import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "../components/Input";
import { Button, InputLabel, Typography } from "@mui/material";
import CustomCard from "../components/Card";
import LoginService from "../services/LoginService";

export default function ResetPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    function sendResetEmail(event: React.FormEvent) {
        event.preventDefault();
        // Send email to the user
        // POST localhost:8000/reset_password
        const loginService = new LoginService();
        loginService.resetPassword(email);
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            id="email_reset_password"
                        />
                    </div>
                    <div className="flex gap-5 w-full items-center ">
                        <Button variant="contained" className="w-full" type="submit">Send me a mail</Button>
                    </div>

                </form>
                <Typography variant="body1" color="primary" onClick={() => navigate("/login")} className="cursor-pointer">
                    Back to login
                </Typography>
            </div >
        </CustomCard>
    )
}