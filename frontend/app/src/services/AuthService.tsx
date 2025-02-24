// Classe pour la gestion de l'authentification avec le backend

import axios from "axios";
import User from "../types/User";

export default class AuthService {

    async register(
        username: string,
        password: string,
        passwordConfirmation: string,
        email: string,
        firstName: string,
        lastName: string
    ) {
        // API call to register on localhost:8000/api/auth/register

        axios.post(
            "http://localhost:8000/api/auth/register",
            {
                username,
                password,
                passwordConfirmation,
                email,
                firstName,
                lastName
            }
        )
            .then((response) => {
                return {
                    success: true,
                    message: "User registered successfully",
                    error: null,
                    user: response.data as User
                }
            })
            .catch((error) => {
                console.error(error);
                return {
                    success: false,
                    message: "An error occurred",
                    error: error,
                    user: null
                }
            });

        return {
            success: false,
            message: "An error occurred",
            error: null,
            user: null
        };

    };

}