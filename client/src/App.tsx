import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { useSelector } from 'react-redux';
import { selectTheme } from './features/themeSlice';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import routes, { DRAIN_ROUTE } from './pages/routes';
import { Container } from '@mui/material';

function App() {
  const currentTheme = useSelector(selectTheme);
  
  const theme = createTheme({
    palette: {
      mode: currentTheme,
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Container
            maxWidth="lg"
            component="main"
            sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
          >
            <Routes>
              {Object.values(routes).map(route =>
                  <Route
                    path={route.pathUrl}
                    element={<route.component/>}
                  />
              )}
              <Route path='*' element={<Navigate to={routes[DRAIN_ROUTE].pathUrl} replace />} />
            </Routes>
          </Container>
        </Layout>
      </ThemeProvider>
    </Router>
  );
}

export default App;