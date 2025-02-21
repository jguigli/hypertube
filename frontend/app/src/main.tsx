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

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)
