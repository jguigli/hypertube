import axios from "axios";
import User from "../types/User";

interface AllUsers {
    id: number;
    user_name: string;
}

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

            console.log(userResponse);

            if (userResponse.status === 200) {
                const user: User = {
                    id: userResponse.data.id,
                    email: userResponse.data.email,
                    username: userResponse.data.user_name,
                    firstName: userResponse.data.first_name,
                    lastName: userResponse.data.last_name,
                    is_logged_in: true,
                    language: "en"
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

    // GET /users
    async getUsers(
        token: string
    ): Promise<
        {
            success: boolean,
            users: AllUsers[] | null,
            error: string | null
        }
    > {
        try {
            const response = await axios.get(
                "/users/",
                {
                    headers: {
                        Authorization: `${token}`
                    }
                }
            );

            if (response.status === 200) {
                const users: AllUsers[] = response.data.users;
                return { success: true, users: users, error: null };
            }
            return { success: false, users: null, error: response.data };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, users: null, error: errorMessage };
        }
    }

    // GET /users/{ user_id }
    async getUser(
        user_id: number,
        token: string
    ): Promise<
        {
            success: boolean,
            user: User | null,
            error: string | null
        }
    > {
        try {
            const response = await axios.get(
                `/users/${user_id}`,
                {
                    headers: {
                        Authorization: `${token}`
                    }
                }
            );
            if (response.status === 200) {
                const user: User = {
                    email: response.data.email,
                    username: response.data.user_name,
                    firstName: response.data.first_name,
                    lastName: response.data.last_name,
                    is_logged_in: true,
                    language: response.data.language || "en"
                };
                return { success: true, user: user, error: null };
            } else {
                return { success: false, user: null, error: response.data };
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, user: null, error: errorMessage };
        }
    }

    // PUT / users / informations
    async setInformations(
        token: string,
        email: string,
        user_name: string,
        first_name: string,
        last_name: string,
    ): Promise<{ success: boolean, error: string | null }> {

        try {

            const response = await axios.put(
                "/users/informations",
                {
                    email: email,
                    user_name: user_name,
                    first_name: first_name,
                    last_name: last_name,
                },
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

        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, error: errorMessage };
        }

    }

    // GET / users / me / picture
    async getPicture(token: string): Promise<
        {
            success: boolean,
            avatar: string | null,
            error: string | null
        }
    > {
        try {
            const response = await axios.get(
                "/users/me/picture",
                {
                    headers: {
                        Authorization: `${token}`,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    responseType: "blob"
                }
            );
            if (response.status === 200) {
                const avatar = response.data;
                if (avatar) {
                    const avatarBase64: string = await this.blobToBase64(avatar);
                    return { success: true, avatar: avatarBase64, error: null };
                }
            }
            return { success: false, avatar: null, error: response.data };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, avatar: null, error: errorMessage };
        }

    }

    // GET / users / { user_id } / picture
    async getPictureById(user_id: number, token: string): Promise<
        {
            success: boolean,
            avatar: string | null,
            error: string | null
        }
    > {
        try {
            const response = await axios.get(
                `/users/${user_id}/picture`,
                {
                    headers: {
                        Authorization: `${token}`
                    },
                    responseType: "blob"
                }
            );
            if (response.status === 200) {
                const avatar = response.data;
                if (avatar) {
                    const avatarBase64: string = await this.blobToBase64(avatar);
                    return { success: true, avatar: avatarBase64, error: null };
                }
            }
            return { success: false, avatar: null, error: response.data };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, avatar: null, error: errorMessage };
        }
    }

    // PUT / users / picture
    async setPicture(token: string, profile_picture: File): Promise<
        {
            success: boolean,
            avatar: string | null,
            error: string | null
        }> {

        const formData = new FormData();
        formData.append("profile_picture", profile_picture);

        const response = await axios.put(
            "/users/picture",
            formData,
            {
                headers: {
                    Authorization: `${token}`
                },
                responseType: "blob"
            }
        );

        if (response.status === 200) {
            const avatar = response.data;
            if (avatar) {
                const avatarBase64: string = await this.blobToBase64(avatar);
                return { success: true, avatar: avatarBase64, error: null };
            }
        }
        return { success: false, avatar: null, error: response.data };

    }

    async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}