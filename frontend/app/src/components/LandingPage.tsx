import { Accordion, AccordionDetails, AccordionSummary, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import CustomCard from "./Card";
import { Separator } from "../pages/Register";
import { ExpandMore, PlayArrow, Search, VideoLibraryOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useActiveLink } from "../contexts/ActiveLinkContext";

const accordionItems = [
    {
        panel: 'panel1',
        icon: <PlayArrow />,
        title: 'Instant Streaming',
        content: 'Watch movies seamlessly without waiting! Hypertube uses BitTorrent technology for smooth, buffer-free streaming.'
    },
    {
        panel: 'panel2',
        icon: <Search />,
        title: 'Smart Search',
        content: 'Find your favorite movies instantly with our advanced search engine. Filter by title, year, or popularity to get exactly what you\'re looking for.'
    },
    {
        panel: 'panel3',
        icon: <VideoLibraryOutlined />,
        title: 'Extensive Library',
        content: 'Discover a vast collection of movies, from timeless classics to the latest releases, all just a click away.'
    }
];

export default function LandingPage() {

    const [expanded, setExpanded] = useState<string | false>(false);

    const { setActiveLink } = useActiveLink();

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            event.preventDefault();
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] p-5">
            <div className="flex flex-col items-center justify-center gap-5">
                <Typography variant="h4" className="font-bold text-center w-full">
                    Welcome
                </Typography>

                <Typography variant="body1" className="text-lg text-center" color="textSecondary">
                    Hypertube is a streaming platform that makes it easy to find and watch videos instantly.
                </Typography>

                <Separator text="Key features" />
                <div className="flex flex-col gap-3 w-full">
                    {accordionItems.map((item) => (
                        <Accordion key={item.panel} expanded={expanded === item.panel} variant="outlined" onChange={handleChange(item.panel)} >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls={`${item.panel}bh-content`}
                                id={`${item.panel}bh-header`}
                            >
                                <Stack direction="row" spacing={2}>
                                    {item.icon}
                                    <Typography>
                                        {item.title}
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    {item.content}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>

                <Separator text="Get started" />
                <Link to="/login" className="w-full" onClick={() => setActiveLink("/login")}>
                    <Button variant="contained" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="w-full" onClick={() => setActiveLink("/register")}>
                    <Button variant="outlined" className="w-full">Register</Button>
                </Link>
            </div>
        </CustomCard>
    )
}
