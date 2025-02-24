import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import PageNotFound from "../pages/404";
import VideoView from "../pages/VideoView";
import Profile from "../pages/Profile";
import ResetPassword from "../pages/ResetPassword";
import PublicRoute from "./PublicRoute.tsx"
import PrivateRoute from "./PrivateRoute";
import Logout from "../pages/Logout.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            {
                path: "register", element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                ),
            },
            {
                path: "login", element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                )
            },
            {
                path: "forgot-password", element: (
                    <PublicRoute>
                        <ResetPassword />
                    </PublicRoute>
                )
            },
            {
                path: "profile/:username", element: (
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                )
            },
            {
                path: "watch/:id", element: (
                    <PrivateRoute>
                        <VideoView />
                    </PrivateRoute>
                )
            },
            {
                path: "logout", element: (
                    <PrivateRoute>
                        <Logout />
                    </PrivateRoute>
                )
            },
            { path: "*", element: <PageNotFound /> },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
