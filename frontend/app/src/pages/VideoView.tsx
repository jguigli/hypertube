import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";


export default function VideoView() {

    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <h1>Video View</h1>
        </>
    )
}
