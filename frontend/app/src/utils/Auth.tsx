import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserService from "../services/UserService";
import User from "../types/User";
import { useNavigate } from "react-router-dom";


export default function Auth() {

    // Get the access_token and token_type from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const access_token = urlParams.get('access_token');
    const token_type = urlParams.get('token_type');

    // Get the user from the useAuth hook
    const { login, user } = useAuth();

    const [error, setError] = useState<string | null>(null);

    // Services
    const userService = new UserService();

    // Navigate to the home page
    const navigate = useNavigate();


    async function handleLogin() {
        try {
            // If the access_token and token_type are not null, log the user in
            if (access_token && token_type) {

                const token = `${token_type} ${access_token}`;

                // GET api/auth/me -> Get the user
                const userResponse = await userService.getMe(token);

                // Check if the request was successful
                if (!userResponse.success || !userResponse.user) {
                    if (userResponse.error) {
                        setError(userResponse.error);
                    } else {
                        setError("An unexpected error occurred, please try again later");
                    }
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

                // Get the user's avatar
                const avatarResponse = await userService.getPicture(token);
                if (avatarResponse.success && avatarResponse.avatar) {
                    newUser.avatar = avatarResponse.avatar;
                } else {
                    alert("An error occurred while getting the user's avatar" + avatarResponse.error || "An unexpected error occurred");
                }

                login(newUser, token);

                // Navigate to the home page
                navigate("/");
            }
        } catch (error) {
            console.error(error);
            setError("An unexpected error occurred, please try again later");
        }
    }

    useEffect(() => {
        handleLogin();
    }, []);

    return (
        <div>
            {error && <div>{error}</div>}
        </div>
    );
}