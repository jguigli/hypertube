import axios from "axios";
import User from "../types/User";

export default class AuthService {


    // TODO:
    // Error handling for the register and login methods
    // Display the error message in the UI
    // Register / login with 42 and Google

    async register(
        username: string,
        password: string,
        passwordConfirmation: string,
        email: string,
        firstName: string,
        lastName: string,
        avatar: File | null,
        language: "en" | "fr"
    ): Promise<{ success: boolean, user: User | null, token: string | null, error: any }> {

        try {
            if (password !== passwordConfirmation) {
                return {
                    success: false, user: null, token: null, error: { message: "Passwords do not match" }
                };
            }

            const response = await axios.post(
                "http://localhost:8000/users/register",
                {
                    email: email,
                    user_name: username,
                    first_name: firstName,
                    last_name: lastName,
                    password: password
                }
            );

            const loginResponse = await this.login(username, password, language);
            let user = loginResponse.user;

            if (loginResponse.success && avatar && user) {
                // PUT /users/picture
                const formData = new FormData();
                formData.append("profile_picture", avatar);

                const token = loginResponse.token;

                await axios.put(
                    "http://localhost:8000/users/picture",
                    formData,
                    {
                        headers: {
                            Authorization: `${token}`
                        }
                    }
                );
                user.avatar = URL.createObjectURL(avatar);
            }

            return { success: true, user: user, token: loginResponse.token, error: null };

        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, user: null, token: null, error: { message: errorMessage } };
        }
    }

    async login(username: string, password: string, language: "en" | "fr"): Promise<{ success: boolean, token: string | null, error: any, user: User | null }> {
        try {

            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post(
                "http://localhost:8000/token",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const token: string = `${response.data.token_type} ${response.data.access_token}`;
            const userResponse = await axios.get(
                "http://localhost:8000/users/me", {
                headers: {
                    Authorization: `${token}`
                }
            });

            const user: User = {
                email: userResponse.data.email,
                firstName: userResponse.data.first_name,
                lastName: userResponse.data.last_name,
                username: userResponse.data.user_name,
                is_logged_in: true,
                language: language
            }

            // Get the user's avatar
            const avatarResponse = await axios.get(
                "http://localhost:8000/users/me/picture",
                {
                    headers: {
                        Authorization: `${token}`
                    },
                    responseType: "blob"
                }
            );

            user.avatar = URL.createObjectURL(avatarResponse.data);

            return { success: true, token, error: null, user: user };
        } catch (error) {
            return { success: false, token: null, error, user: null };
        }
    }


    async registerOAuth(provider: "42" | "google") {
        try {
            window.open(`http://localhost:8000/auth/${provider}`, "_self");
        }
        catch (error) {
            return error;
        }
    }

}