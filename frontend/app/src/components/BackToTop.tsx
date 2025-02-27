import { KeyboardArrowUp } from "@mui/icons-material";
import { IconButton } from "@mui/material";
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
                <IconButton
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className='bottom-0 right-0 bg-gray-900 text-gray-50'
                    sx={{ zIndex: 1000, position: 'fixed' }}
                >
                    <KeyboardArrowUp fontSize='large' />
                </IconButton>
            )
            }
        </>
    );
}