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

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <SearchProvider>
                    <VideoProvider>
                        <AppRouter />
                    </VideoProvider>
                </SearchProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)
