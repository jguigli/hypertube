import { Card } from "@mui/material";

export default function CustomCard(
    {
        additionalClasses,
        children
    }: {
        additionalClasses?: string,
        children: React.ReactNode
    }
) {

    return (
        <Card
            variant="outlined"
            className={`bg-gray-950 ${additionalClasses}`}
            sx={{
                borderRadius: "10px",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
        >
            {children}
        </Card>
    );
}