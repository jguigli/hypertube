import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import { useState } from "react";
import Input from "../components/Input";
import { Divider, Typography } from "@mui/material";

export default function ResetPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);



    return (

        <div className="flex flex-col items-start gap-5 w-[500px]">

            <Typography variant="h4">Reset Password</Typography>
            <p>Enter your email address and we will send you a link to reset your password.</p>

            <Divider className="w-full" />

            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label>Email</label>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <Button
                    text="Reset password"
                    type="submit"
                    onClick={() => {
                        setError("");
                        setLoading(true);
                        setTimeout(() => {
                            setLoading(false);
                            setError("Email not found");
                        }, 2000);
                    }}
                />

                {error && <p>{error}</p>}


            </form>
            <Divider className="w-full" />
            <Button onClick={() => navigate("/login")} text="Back to login" />
        </div >
    )
}