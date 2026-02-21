import { Header } from '@/components/common/Header';
import { GlobalMessageBar } from '@/components/layout/GlobalMessageBar';
import { Box, Container } from '@mui/material';

export const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      width: '100%',
    }}
  >
    <Header />
    <GlobalMessageBar />
    <Container
      maxWidth="lg"
      sx={{
        maxWidth: { lg: '1000px' },
        mt: 4,
        px: { xs: 2, lg: 0 },
        pb: 4,
      }}
    >
      {children}
    </Container>
  </Box>
);
