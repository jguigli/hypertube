import axios from "axios";

// Axios configuration
const hostname = import.meta.env.VITE_HOSTNAME || window.location.hostname;
axios.defaults.baseURL = `http://${hostname}:3000/api`;

export default class LoginService {

    // POST /token
    async login(
        username: string,
        password: string
    ): Promise<{ success: boolean, token: string | null, error: string | null }> {

        try {

            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post(
                "/token",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            if (response.status == 200) {
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

    // POST /reset_password
    async resetPassword(email: string): Promise<{ success: boolean, error: any }> {
        try {
            const response = await axios.post("/reset_password", { email: email });
            if (response.status === 204) {
                return { success: true, error: null };
            }
            return { success: false, error: response.data.message };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, error: { message: errorMessage } };
        }
    }

    // PUT /password
    async changePassword(newPassword: string, confirmPassword: string, authToken: string): Promise<
        {
            success: boolean,
            error: any
        }
    > {
        try {
            const formData = new URLSearchParams();
            formData.append("password", newPassword);
            formData.append("password_confirmation", confirmPassword);
            const response = await axios.put(
                "/password",
                {
                    password: newPassword,
                    password_confirmation: confirmPassword,
                },
                {
                    headers: {
                        Authorization: authToken,
                    },
                }
            );
            console.log(response);
            return { success: response.status === 204, error: null };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            return { success: false, error: { message: errorMessage } };
        }
    }


    // GET /auth/42/callback
    // GET /auth/google/callback

    // GET /auth/42 and GET /auth/google
    async registerOAuth(provider: "42" | "google") {
        try {
            window.open(`http://localhost:3000/api/auth/${provider}`, "_self");
        }
        catch (error) {
            return error;
        }
    }

}