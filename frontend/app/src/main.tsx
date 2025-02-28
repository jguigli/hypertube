import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import AppRouter from './router/Router.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material'
import theme from './styles/MUIThemeProvider.tsx'
import { SearchProvider } from './contexts/SearchContext.tsx'
import { VideoProvider } from './contexts/VideoContext.tsx'
import { MoviesProvider } from './contexts/MovieContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <MoviesProvider>
                <SearchProvider>
                    <AuthProvider>
                        <VideoProvider>
                            <AppRouter />
                        </VideoProvider>
                    </AuthProvider>
                </SearchProvider>
            </MoviesProvider>
        </ThemeProvider>
    </StrictMode>,
)
