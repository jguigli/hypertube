import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useActiveLink } from "../contexts/ActiveLinkContext";

export default function Logout() {

    const { logout } = useAuth();
    const navigate = useNavigate();
    const {setActiveLink } = useActiveLink();

    useEffect(() => {
        logout();
        setActiveLink("/");
        navigate("/");
    }, [logout, navigate]);

    return <></>;
}