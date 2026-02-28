import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { AnalysisResultPage } from '@/pages/AnalysisResultPage';
import { AuthorityCheckPage } from '@/pages/AuthorityCheckPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InterviewSessionPage } from '@/pages/InterviewSessionPage';
import { LoginPage } from '@/pages/LoginPage';
import { QuestionSelectionPage } from '@/pages/QuestionSelectionPage';
import { SignupPage } from '@/pages/SignupPage';
import { TopPage } from '@/pages/TopPage';
import { theme } from '@/theme/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HistoryPage } from './pages/HistoryPage';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <MessageProvider>
              <Routes>
                <Route path="/" element={<TopPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {/* <Route path="/dev/health" element={<HealthCheckPage />} /> */}

                <Route element={<AuthGuard />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/questions" element={<QuestionSelectionPage />} />
                  <Route path="/authority-check/:questionId" element={<AuthorityCheckPage />} />
                  <Route path="/interview/session/:questionId" element={<InterviewSessionPage />} />
                  <Route path="/analysis-result/:answerId" element={<AnalysisResultPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                </Route>
              </Routes>
            </MessageProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      {/* {<ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
}
export default App;
