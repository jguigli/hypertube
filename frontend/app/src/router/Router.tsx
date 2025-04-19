import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import Home from "../pages/Home.tsx";
import Register from "../pages/Register.tsx";
import Login from "../pages/Login.tsx";
import PageNotFound from "../pages/404.tsx";
import ResetPassword, { ChangePassword } from "../pages/ResetPassword.tsx";
import PublicRoute from "./PublicRoute.tsx"
import PrivateRoute, { LogoutRoute } from "./PrivateRoute.tsx";
import Logout from "../pages/Logout.tsx";
import PublicProfile from "../pages/Profile.tsx";
import UserSettings from "../pages/UserSettings.tsx";
import HomeRouter from "./HomeRouter.tsx";
import Auth from "../utils/Auth.tsx";
import Watch from "../pages/Watch.tsx";
import { MoviesProvider } from "../contexts/MovieContext.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: (
                    <HomeRouter>
                        <MoviesProvider>
                            <Home />
                        </MoviesProvider>
                    </HomeRouter>
                )
            },
            {
                path: "register",
                element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                )
            },
            {
                path: "/auth/",
                element: (
                    <PublicRoute>
                        <Auth />
                    </PublicRoute>
                )
            },
            {
                path: "login",
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                )
            },
            {
                path: "forgot-password",
                element: (
                    <PublicRoute>
                        <ResetPassword />
                    </PublicRoute>
                )
            },
            {
                path: "reset-password",
                element: (
                    <PublicRoute>
                        <ChangePassword />
                    </PublicRoute>
                )
            },
            {
                path: "profile/:username",
                element: (
                    <PrivateRoute>
                        <PublicProfile />
                    </PrivateRoute>
                )
            },
            {
                path: "settings",
                element: (
                    <PrivateRoute>
                        <UserSettings />
                    </PrivateRoute>
                )
            },
            {
                path: "watch/:id",
                element: (
                    <PrivateRoute>
                        <Watch />
                    </PrivateRoute>
                )
            },
            {
                path: "logout",
                element: (
                    <LogoutRoute>
                        <Logout />
                    </LogoutRoute>
                )
            },
            {
                path: "*",
                element: <PageNotFound />
            }
        ]
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
