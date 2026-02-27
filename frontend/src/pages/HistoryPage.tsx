import { EmptyContentView } from '@/components/common/EmptyContentView';
import { LoadingView } from '@/components/common/LoadingView';
import { PageErrorHandler } from '@/components/common/PageErrorHandler';
import { HistoryCard } from '@/components/features/history/HistoryCard';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useHistory } from '@/hooks/useHistory';
import { FilterList as FilterListIcon, Sort as SortIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Grid, Pagination, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const HistoryPage = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // TanStack Queryから必要な状態を取り出す
  const { data, isLoading, error, refetch, isPlaceholderData } = useHistory(page);

  // 初回（キャッシュもなく、何も表示するものがない時）のみLoadingViewを出す
  if (isLoading) return <LoadingView />;

  // エラーハンドリング
  // 2. エラーハンドリング（交通整理）
  if (error) {
    return <PageErrorHandler error={error} onRetry={refetch} />;
  }

  // 3. データが空の場合の表示（正常系だが中身なし）
  if (!data || data.answers.length === 0) {
    return (
      <EmptyContentView
        title="履歴がありません"
        message="まだ練習の記録がありません。まずは最初の練習を始めてみましょう！"
        actionText="練習を始める"
        onRetry={() => navigate('/questions')}
      />
    );
  }

  return (
    <MainLayout>
      <PageHeader
        leftSlot={
          <>
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.primary' }}
            ></Button>
            <Box
              sx={{
                borderRadius: 0.5,
                bgcolor: '#EFEBE9',
                px: 1,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">履歴一覧</Typography>
            </Box>
          </>
        }
      />

      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="baseline">
          <Typography variant="body2" color="text.secondary">
            検索結果：
          </Typography>
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
            {data?.meta.totalCount ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            件
          </Typography>
        </Stack>

        {/* 操作エリア：今回は形のみ */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="text"
            size="small"
            startIcon={<FilterListIcon />}
            sx={{ color: 'text.secondary' }}
          >
            絞り込み
          </Button>
          <Button
            variant="text"
            size="small"
            startIcon={<SortIcon />}
            sx={{ color: 'text.secondary' }}
          >
            並べ替え
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          opacity: isPlaceholderData ? 0.5 : 1, // ロード中は薄く
          transition: 'opacity 0.2s',
          pointerEvents: isPlaceholderData ? 'none' : 'auto',
          minHeight: '400px',
        }}
      >
        <Grid container spacing={3}>
          {data.answers.map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.answerId}>
              <HistoryCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ページネーションエリア */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={data.meta.totalPages}
          page={page}
          onChange={(_, value) => {
            setPage(value);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={isPlaceholderData}
          color="secondary"
        />
      </Box>
    </MainLayout>
  );
};
