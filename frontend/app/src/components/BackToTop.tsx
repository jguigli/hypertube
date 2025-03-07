import { KeyboardArrowUp } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useEffect, useState } from "react";

export default function BackToTop() {

    const [isOnTop, setIsOnTop] = useState(
        window.scrollY > 0 ? false : true
    );

    useEffect(() => {
        window.addEventListener('scroll', () => {
            setIsOnTop(window.scrollY > 0 ? false : true);
        });
    }, []);

    return (
        <>
            {isOnTop ? null : (
                <Fab
                    color="primary"
                    sx={{ position: "fixed", bottom: 92, right: 16 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <KeyboardArrowUp fontSize='large' />
                </Fab>
            )
            }
        </>
    );
}