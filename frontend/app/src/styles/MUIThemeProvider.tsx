import { createTheme } from '@mui/material/styles';

// https://zenoo.github.io/mui-theme-creator/
// https://m2.material.io/inline-tools/color/

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#31729c',
        },
        secondary: {
            main: '#f50057',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },

});

export default theme;

