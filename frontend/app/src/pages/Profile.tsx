import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Profile() {

    // const navigate = useNavigate();

    const params = useParams();
    const { user } = useAuth();
    // if (!user) {


    // }
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    let param_username = params.username;

    // useEffect(() => {
    //     if (username === undefined) {
    //         // navigate("/");
    //         // return;
    //     }
    // }, [param_username]);


    // useEffect(() => {
    //     if (user) {
    //         setUsername(user.username);
    //         setEmail(user.email);
    //     }
    // }, [user]);



    return (
        <>
            <h1>Profile</h1>
            {param_username === user?.username ? (
                <div>

                    <div className="flex flex-col space-y-4">
                        <div>
                            <label htmlFor="username_profile">Username:</label>
                            <Input
                                value={username}
                                placeholder="Your new username"
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                id="username_profile"
                            />
                        </div>


                        <div>
                            <label htmlFor="email_profile">Email:</label>
                            <Input
                                value={email}
                                placeholder="Your new email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="email_profile"
                            />
                        </div>

                        <Button
                            onClick={() => {
                            }}
                            text="Save"
                        />

                    </div>
                </div>

            ) : (
                <p>This is the profile of {param_username}</p>
            )}
        </>
    )
}
