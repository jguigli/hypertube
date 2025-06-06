import { SvgIcon } from "@mui/material";


export default function Icon42() {
    const color = "#fff";
    return (
        <SvgIcon>
            <svg width="57px" height="40px" viewBox="0 0 57 40" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>42 Final sigle seul</title>
                <defs>
                    <filter id="filter-1">
                        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 1.000000 0"></feColorMatrix>
                    </filter>
                    <polygon id="path-2" points="0 0.204536082 31.6266585 0.204536082 31.6266585 39.9752577 0 39.9752577"></polygon>
                </defs>
                <g id="Page-1" stroke="none" fill="none" >
                    <g id="Home-page" transform="translate(-20.000000, -119.000000)">
                        <g id="42-Final-sigle-seul" transform="translate(0.000000, 86.000000)" filter="url(#filter-1)">
                            <g transform="translate(20.000000, 33.000000)">
                                <g id="Group-3">
                                    <g id="Clip-2"></g>
                                    <polyline id="Fill-1" fill={color} mask="url(#mask-3)" points="31.6266585 0.204536082 21.0841616 0.204536082 0 21.0969072 0 29.5538144 21.0841616 29.5538144 21.0841616 40 31.6266585 40 31.6266585 21.0969072 10.5420808 21.0969072 31.6266585 0.204536082"></polyline>
                                </g>
                                <polyline id="Fill-4" fill={color} points="35.3488372 10.2325581 45.5813953 0 35.3488372 0 35.3488372 10.2325581"></polyline>
                                <polyline id="Fill-5" fill={color} points="56.744186 10.5424969 56.744186 0 46.5118299 0 46.5118299 10.5424969 36.2790698 21.0849939 36.2790698 31.627907 46.5118299 31.627907 46.5118299 21.0849939 56.744186 10.5424969"></polyline>
                                <polyline id="Fill-6" fill={color} points="56.744186 21.3953488 46.5116279 31.627907 56.744186 31.627907 56.744186 21.3953488"></polyline>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </SvgIcon>
    );
}