import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function Profile() {

    const navigate = useNavigate();

    const params = useParams();

    let username = params.username;

    useEffect(() => {
        if (username === undefined) {
            navigate("/");
            return;
        }
    }, [username]);

    const { user } = useAuth();

    // if (user === undefined) {
    //     return
    // }


    // useEffect(() => {
    //     if (user === null) {
    //         navigate("/login");
    //         return;
    //     }
    //     if (username === undefined) {
    //         navigate("/profile/" + user.username);
    //         return;
    //     }

    // }, [username, user, navigate]);


    return (
        <>
            <h1>Profile</h1>
            {username === user?.username ? (
                <p>This is your profile</p>
            ) : (
                <p>This is the profile of {username}</p>
            )}
        </>
    )
}
