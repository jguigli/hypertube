import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import Home from "../pages/Home.tsx";
import Register from "../pages/Register.tsx";
import Login from "../pages/Login.tsx";
import PageNotFound from "../pages/404.tsx";
import VideoView from "../pages/VideoView.tsx";
import ResetPassword, { ChangePassword } from "../pages/ResetPassword.tsx";
import PublicRoute from "./PublicRoute.tsx"
import PrivateRoute from "./PrivateRoute.tsx";
import Logout from "../pages/Logout.tsx";
import PublicProfile from "../pages/Profile.tsx";
import UserSettings from "../pages/UserSettings.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "register",
                element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                ),
            },
            {
                path: "/auth/google/callback",
                element: (
                    <PublicRoute>
                        <></>
                    </PublicRoute>
                ),
            },
            {
                path: "/auth/42/callback",
                element: (
                    <PublicRoute>
                        <></>
                    </PublicRoute>
                ),
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
                        <VideoView />
                    </PrivateRoute>
                )
            },
            {
                path: "logout",
                element: (
                    <PrivateRoute>
                        <Logout />
                    </PrivateRoute>
                )
            },
            {
                path: "*",
                element: <PageNotFound />
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
