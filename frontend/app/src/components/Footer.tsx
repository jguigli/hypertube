import { Typography } from "@mui/material"

export default function Footer() {

    const year: number = new Date().getFullYear()

    return (
        <footer id="footer" className="bg-gray-950 text-gray-50 text-center py-2 border-t border-gray-500/50">
            <Typography variant="body2" component="span">
                &copy; {year}
            </Typography>
        </footer>
    )
}
