import { LoadingView } from '@/components/common/LoadingView'; // 共通部品
import { PageErrorHandler } from '@/components/common/PageErrorHandler';
import { HistoryCard } from '@/components/features/history/HistoryCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard'; // 新設するフック
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const StatItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit: string;
}) => (
  <Box
    sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mt: 0.5 }}>
      <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
        {unit}
      </Typography>
    </Box>
  </Box>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useDashboard();

  // 1. ローディング状態
  if (isLoading) return <LoadingView />;

  if (error) {
    return (
      <MainLayout>
        <Container sx={{ mt: 4 }}>
          <PageErrorHandler error={error} onRetry={refetch} />
        </Container>
      </MainLayout>
    );
  }

  if (!data) return null;

  const { stats, latestAnswers } = data;
  const totalMinutes = Math.floor(stats.totalDurationSeconds / 60);
  return (
    <MainLayout>
      <Container sx={{ py: 4 }}>
        {/* 最新履歴セクション */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              <Box component="span" sx={{ color: 'primary.main' }}>
                {user?.username || 'ゲスト'}
              </Box>{' '}
              さんの最新の履歴
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {latestAnswers.length > 0 ? (
              latestAnswers.map((item) => (
                <Grid size={{ xs: 12, md: 4 }} key={item.answerId}>
                  <HistoryCard item={item} />
                </Grid>
              ))
            ) : (
              <Grid size={12}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography color="text.primary">まだ練習履歴がありません。</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* 統計情報セクション */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            トレーニング統計
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <StatItem label="累計練習回数" value={stats.totalCount} unit="回" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatItem label="累計日数" value={stats.totalDays} unit="日" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <StatItem label="練習時間" value={totalMinutes} unit="分" />
            </Grid>
          </Grid>
        </Box>

        {/* 下部アクションエリア */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'center', alignItems: 'center', mt: 3 }}
        >
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/history"
            sx={{ px: 8, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
            startIcon={<FolderOutlinedIcon />}
          >
            履歴一覧
          </Button>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/questions"
            sx={{ px: 8, py: 1.5, borderRadius: 1, fontWeight: 'bold' }}
            startIcon={<VideocamOutlinedIcon />}
          >
            練習を始める
          </Button>
        </Stack>
      </Container>
    </MainLayout>
  );
};
