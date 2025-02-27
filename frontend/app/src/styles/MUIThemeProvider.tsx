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
            main: '#ffffff',
        },
        background: {
            paper: '#030712',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    input: {
                        "&:-webkit-autofill": {
                            WebkitBoxShadow: "0 0 0 100px #030712 inset",
                            WebkitTextFillColor: "default",
                        },
                        "& .MuiInputBase-root.Mui-disabled": {
                            color: "rgba(0, 0, 0, 0.6)" // (default alpha is 0.38)
                        },
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    input: {
                        "&:-webkit-autofill": {
                            WebkitBoxShadow: "0 0 0 100px #030712 inset",
                            WebkitTextFillColor: "default",
                        },
                    },
                },
            },
        },

    },

});

export default theme;

