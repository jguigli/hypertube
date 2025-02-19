import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout() {

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        const layout = document.getElementById("layout");
        if (layout) {
            // Change the layout grid columns
            layout.classList.toggle("grid-cols-[250px_1fr]");
            layout.classList.toggle("grid-cols-[50px_1fr]");
        }
    };

    return (
        <div
            id="layout"
            className="grid
                grid-rows-[auto_1fr_auto]
                grid-cols-[50px_1fr]
                min-h-screen"
        >
            <Navbar toggle_menu={toggleMenu} />
            <Sidebar open={menuOpen} toggle_menu={toggleMenu} />
            <main className="col-span-1 row-span-2 row-start-2 col-start-2">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
