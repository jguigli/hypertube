import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import BackToTop from "./BackToTop";

export default function Layout() {

    return (
        <>
            <Navbar />
            <Sidebar />
            <main id="main" className="bg-gray-900 text-gray-50 p-4">
                <Outlet />
                <BackToTop />
            </main>
            <Footer />
        </>
    );
}
