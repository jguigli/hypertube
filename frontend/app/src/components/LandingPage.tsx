import { Accordion, AccordionDetails, AccordionSummary, Button, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import CustomCard from "./Card";
import { Separator } from "../pages/Register";
import { ExpandMore, PlayArrow, Search, VideoLibraryOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useActiveLink } from "../contexts/ActiveLinkContext";
import MovieService from "../services/MovieService";
import { useAuth } from "../contexts/AuthContext";
import MovieCard from "./MovieCard";
import Movie from "../types/Movie";
import Carousel from 'react-material-ui-carousel'
import { useTranslation  } from "react-i18next";

const accordionItems = [
    {
        panel: 'panel1',
        icon: <PlayArrow />,
        title: "Instant Streaming",
        content:"Watch movies seamlessly without waiting! Hypertube uses BitTorrent technology for smooth, buffer-free streaming."
    },
    {
        panel: 'panel2',
        icon: <Search />,
        title: "Smart Search",
        content: "Find your favorite movies instantly with our advanced search engine. Filter by title, year, or popularity to get exactly what you\'re looking for."
    },
    {
        panel: 'panel3',
        icon: <VideoLibraryOutlined />,
        title: "Extensive Library",
        content: "Discover a vast collection of movies, from timeless classics to the latest releases, all just a click away."
    }
];


function TopMovies() {

    const movieService = new MovieService();
    const { user } = useAuth();
    const [topMovies, setTopMovies] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchTopMovies = async () => {
            const response = await movieService.getTopMovies(user.language);
            if (response.success) {
                setTopMovies(response.data);
            }
        };
        fetchTopMovies();
    }, [user.language]);

    return (
        <div className="flex flex-col items-center justify-center gap-5 w-full lg:w-[500px] h-fill max-h-full">
            <Carousel className="w-full lg:w-[500px] h-full max-h-full" navButtonsAlwaysVisible={false}>
                {topMovies.map((movie, id) => (
                    <MovieCard key={id} movie={movie} lazy_load={false} />
                ))}
            </Carousel>
        </div>
    )
}


export default function LandingPage() {

    const [expanded, setExpanded] = useState<string | false>(false);
    const { setActiveLink } = useActiveLink();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            event.preventDefault();
            setExpanded(isExpanded ? panel : false);
        };

    useEffect(() => {
        // Check if there is (access_token, token_type and context) in the url params
        // If yes, navigate to the reset password page
        // If no, display the home page
        const urlParams = new URLSearchParams(window.location.search);
        const access_token = urlParams.get('access_token');
        const token_type = urlParams.get('token_type');
        const context = urlParams.get('context');
        if (access_token && token_type && context === 'reset_password') {
            navigate(`/reset-password?access_token=${access_token}&token_type=${token_type}&context=${context}`);
        }
    }, [navigate]);

    return (

        <CustomCard additionalClasses="flex flex-col align-center justify-center items-center p-5 min-h-[80vh] max-w-[100%]">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-5 h-full w-full">
                <div className="flex flex-col items-center justify-center gap-5 w-full lg:w-[500px]">
                    <Typography variant="h4" className="font-bold text-center w-full">
                        {t("Welcome")}
                    </Typography>
                    <Typography variant="body1" className="text-lg text-center" color="textSecondary">
                        {t("Hypertube is a streaming platform that makes it easy to find and watch videos instantly.")}
                    </Typography>
                    <Separator text={t("Key features")} />
                    <div className="flex flex-col gap-3 w-full max-h-[400px] overflow-y-auto">
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
                                            {t(item.title)}
                                        </Typography>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        {t(item.content)}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}

                    </div>
                    <Separator text={t("Get started")} />
                    <Link to="/login" className="w-full" onClick={() => setActiveLink("/login")}>
                        <Button variant="contained" className="w-full">{t("Login")}</Button>
                    </Link>
                    <Link to="/register" className="w-full" onClick={() => setActiveLink("/register")}>
                        <Button variant="outlined" className="w-full">{t("Register")}</Button>
                    </Link>
                </div>
                <TopMovies />
            </div>
        </CustomCard>


    )
}
