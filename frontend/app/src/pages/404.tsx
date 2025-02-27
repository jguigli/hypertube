import { Button, Typography } from "@mui/material";
import CustomCard from "../components/Card";
import { Link } from "react-router-dom";

export default function PageNotFound() {

    return (
        <CustomCard additionalClasses="">
            <div className="flex flex-col items-center justify-center space-y-4 p-10 gap-9 ">
                <Typography variant="h4">Error 404: Page not found</Typography>
                <Typography variant="body1">Sorry, the page you are looking for does not exist.</Typography>
                <Link to="/">
                    <Button variant="contained" color="primary">Go back to home</Button>
                </Link>
            </div>
        </CustomCard>
    )
}
