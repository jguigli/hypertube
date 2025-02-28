import axios from "axios";
import User from "../types/User";

// Axios configuration
axios.defaults.baseURL = "http://localhost:8000";


export default class UserService {

    // POST /users/register
    async register(
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string,
    ):
        Promise<
            {
                success: boolean,
                token: string | null,
                error: string | null
            }
        > {


        try {

            const response = await axios.post(
                "/users/register",
                {
                    email: email,
                    user_name: username,
                    first_name: firstName,
                    last_name: lastName,
                    password: password
                }
            );

            if (response.status === 200) {
                const access_token = response.data.access_token;
                const token_type = response.data.token_type;
                const token = `${token_type} ${access_token}`;
                return { success: true, token: token, error: null };
            } else {
                return { success: false, token: null, error: response.data };
            }

        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, token: null, error: errorMessage };
        }
    }

    // GET / users / me
    async getMe(
        token: string
    ): Promise<
        {
            success: boolean,
            user: User | null,
            error: string | null
        }
    > {

        try {
            const userResponse = await axios.get(
                "/users/me",
                {
                    headers: {
                        Authorization: `${token}`
                    }
                }
            );

            if (userResponse.status === 200) {
                const user = {
                    email: userResponse.data.email,
                    username: userResponse.data.user_name,
                    firstName: userResponse.data.first_name,
                    lastName: userResponse.data.last_name
                };
                return { success: true, user: user, error: null };
            } else {
                return { success: false, user: null, error: userResponse.data };
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, user: null, error: errorMessage };
        }
    }
    // GET / users / { user_id }

    // PUT / users / informations

    // GET / users / me / picture

    // GET / users / { user_id } / picture

    // PUT / users / picture
    async setPicture(token: string, profile_picture: File): Promise<{ success: boolean, error: string | null }> {

        const formData = new FormData();
        formData.append("profile_picture", profile_picture);

        const response = await axios.put(
            "/users/picture",
            formData,
            {
                headers: {
                    Authorization: `${token}`
                }
            }
        );

        if (response.status === 200) {
            return { success: true, error: null };
        }
        return { success: false, error: response.data };

    }



    // TODO:
    // Error handling for the register and login methods
    // Display the error message in the UI
    // Register / login with 42 and Google




}