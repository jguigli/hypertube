import axios from "axios";

// Axios configuration
axios.defaults.baseURL = "http://localhost:8000";


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
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
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
            console.log(response);
            return { success: response.status === 200, error: null };
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.detail || errorMessage;
            }
            console.log(errorMessage);
            return { success: false, error: { message: errorMessage } };
        }
    }

    // PUT /password

    // GET /auth/42/callback
    // GET /auth/google/callback

    // GET /auth/42 and GET /auth/google
    async registerOAuth(provider: "42" | "google") {
        try {
            window.open(`http://localhost:8000/auth/${provider}`, "_self");
        }
        catch (error) {
            return error;
        }
    }

}