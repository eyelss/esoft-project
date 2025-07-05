import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { useSelector } from 'react-redux';
import { selectTheme } from './features/themeSlice';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import routes, { drainRoute } from './pages/routes';
import { Container } from '@mui/material';
import { verifySession } from './features/authSlice';
import { useAppDispatch } from './store';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const currentTheme = useSelector(selectTheme);
  const dispatch = useAppDispatch();

  const theme = createTheme({
    palette: {
      mode: currentTheme,
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch])

  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Container
            maxWidth="xl"
            component="main"
            sx={{ display: 'flex', flexDirection: 'column', my: 8, gap: 2 }}
          >
            <Routes>
              {Object.values(routes).map(route =>
                  <Route
                    path={route.pathUrl}
                    element={<route.component/>}
                  />
              )}
              <Route path='*' element={<Navigate to={drainRoute.pathUrl} />} />
            </Routes>
          </Container>
        </Layout>
      </ThemeProvider>
      </LocalizationProvider>
    </Router>
  );
}

export default App;