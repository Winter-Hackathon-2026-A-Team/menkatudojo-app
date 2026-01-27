import { TopPage } from '@/pages/TopPage';
import { HealthCheckPage } from '@/pages/dev/HealthCheckPage';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/dev/health" element={<HealthCheckPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
