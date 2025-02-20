import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import PageNotFound from "../pages/404";
import VideoView from "../pages/VideoView";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "register", element: <Register /> },
            { path: "login", element: <Login /> },
            { path: "video", element: <VideoView /> },
            { path: "*", element: <PageNotFound /> },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
