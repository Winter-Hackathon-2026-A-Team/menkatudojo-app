// src/pages/DashboardPage.tsx
import { MainLayout } from '@/components/layout/MainLayout';
import { Box, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const DashboardPage = () => {
  return (
    <MainLayout>
      <Container>
        <Box>
          <Button variant="contained" component={RouterLink} to="/questions">
            練習を始める
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
};
