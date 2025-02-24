import axios from "axios";
import User from "../types/User";

export default class AuthService {
    async register(
        username: string,
        password: string,
        passwordConfirmation: string,
        email: string,
        firstName: string,
        lastName: string,
        avatar: File | null
    ): Promise<{ success: boolean, error: any }> {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("passwordConfirmation", passwordConfirmation);
        formData.append("email", email);
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            await axios.post("http://localhost:8000/api/auth/signup", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    }

    async login(username: string, password: string): Promise<{ success: boolean, token: string | null, error: any, user: User | null }> {
        try {
            const response = await axios.post("http://localhost:8000/api/auth/login", { username, password });
            const token = response.data.access_token;
            const user = response.data.user as User;
            return { success: true, token, error: null, user: user };
        } catch (error) {
            return { success: false, token: null, error, user: null };
        }
    }
}