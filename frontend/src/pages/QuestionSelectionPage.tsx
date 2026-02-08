import { EmptyContentView } from '@/components/common/EmptyContentView';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { QuestionList } from '@/components/features/questions/QuestionList';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessage } from '@/contexts/MessageContext';
import { useGroupedQuestions } from '@/hooks/useQuestions';
import { getErrorMessage } from '@/utils/errorHandlers';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const QuestionSelectionPage = () => {
  // server state管理（TanStack Query）
  const {
    data: groupedQuestions,
    isPending,
    isError,
    error,
    refetch,
    isCriticalError,
    isClientError,
  } = useGroupedQuestions();
  const { showMessage } = useMessage();

  // 400系エラーのみ、副作用としてメッセージを出力
  useEffect(() => {
    if (isError && !isCriticalError) {
      showMessage(getErrorMessage(error), 'error');
    }
  }, [isError, isCriticalError, error, showMessage]);

  const [questionId, setQuestionId] = useState<number | null>(null);

  // 関数：質問を選択する
  const handleSelect = (id: number) => {
setQuestionId((prev) => (prev === id ? null : id));
  };

  const navigate = useNavigate();

  // 初期は読み込み中を出力
  if (isPending) return <LoadingView />;

  // 500系エラー
  if (isCriticalError) {
    return <ErrorView message={getErrorMessage(error)} onRetry={() => window.location.reload()} />; // リロードで対応
  }

  // データが空、または400系エラー時の表示
  if (isClientError) {
    return (
      <EmptyContentView
        message={getErrorMessage(error)}
        onRetry={() => refetch()} // APIの再叩きで対応
      />
    );
  }
  // undefindの可能性を排除
  if (!groupedQuestions) return null;
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
              <Typography variant="h6">質問選択</Typography>
            </Box>
          </>
        }
        rightSlot={
          <Button variant="outlined" startIcon={<AddIcon />}>
            質問を作成
          </Button>
        }
      />
      <QuestionList
        groupedQuestions={groupedQuestions}
        questionId={questionId}
        onSelect={handleSelect}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          mt: 3,
        }}
      >
        <Button variant="outlined" size="large" sx={{ minWidth: 230 }} startIcon={<ShuffleIcon />}>
          ランダムに1問練習
        </Button>
        <Button
          variant="contained"
          component={RouterLink}
          disabled={questionId === null}
          to={questionId !== null ? `/authority-check/${questionId}` : '#'}
          size="large"
          startIcon={<VideocamOutlinedIcon />}
          sx={{ minWidth: 230 }}
        >
          選択した質問で練習を開始
        </Button>
      </Stack>
    </MainLayout>
  );
};

export default QuestionSelectionPage;
