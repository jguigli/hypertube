import './utils/translations/i18n';
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import AppRouter from './router/Router.tsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material'
import theme from './styles/MUIThemeProvider.tsx'
import { ActiveLinkProvider } from './contexts/ActiveLinkContext.tsx'
import { setupAxiosInterceptors } from './services/axiosConfig.ts'
import { SearchProvider } from './contexts/SearchContext.tsx';
import { FilterSortProvider } from './contexts/FilterSortContext.tsx';

function Main() {

    const { logoutAndRedirect } = useAuth();

    setupAxiosInterceptors(logoutAndRedirect);

    return (
        <ThemeProvider theme={theme}>
            <SearchProvider>
                <FilterSortProvider>
                    <ActiveLinkProvider>
                        <AppRouter />
                    </ActiveLinkProvider>
                </FilterSortProvider>
            </SearchProvider>
        </ThemeProvider>
    );
}

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <Main />
    </AuthProvider>
)
