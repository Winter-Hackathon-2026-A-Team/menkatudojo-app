import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { AuthorityCheckPage } from '@/pages/AuthorityCheckPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { QuestionSelectionPage } from '@/pages/QuestionSelectionPage';
import { InterviewSessionPage } from '@/pages/InterviewSessionPage';
import { SignupPage } from '@/pages/SignupPage';
import { TopPage } from '@/pages/TopPage';
import { HealthCheckPage } from '@/pages/dev/HealthCheckPage';
import { theme } from '@/theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <MessageProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<TopPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dev/health" element={<HealthCheckPage />} />

                <Route element={<AuthGuard children={<Outlet />} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/questions" element={<QuestionSelectionPage />} />
                  <Route path="/authority-check/:questionId" element={<AuthorityCheckPage />} />
                  <Route path="/interview/session/:questionId" element={<InterviewSessionPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </MessageProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
export default App;
