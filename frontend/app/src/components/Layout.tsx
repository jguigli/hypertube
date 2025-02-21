import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout() {

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <Navbar toggle_menu={toggleMenu} />
            <Sidebar open={menuOpen} toggle_menu={toggleMenu} />
            <main id="main" className="bg-gray-900 text-gray-50 p-4">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
