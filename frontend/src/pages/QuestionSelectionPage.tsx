import { EmptyContentView } from '@/components/common/EmptyContentView';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { CreateQuestionModal } from '@/components/features/questions/CreateQuestionModal';
import { QuestionList } from '@/components/features/questions/QuestionList';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessage } from '@/contexts/MessageContext';
import { useGroupedQuestions } from '@/hooks/useGroupedQuestions';
import { getErrorMessage } from '@/utils/errorHandlers';
import { getRandomQuestionId } from '@/utils/questionUtils';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const QuestionSelectionPage = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [questionId, setQuestionId] = useState<number | null>(null);
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

  const categories = useMemo(() => Object.keys(groupedQuestions || []), [groupedQuestions]);

  const handleRandomSelect = () => {
    // データが存在しない場合は中断
    if (!groupedQuestions) return;

    const randomId = getRandomQuestionId(groupedQuestions);

    if (randomId !== null) {
      navigate(`/authority-check/${randomId}`);
    } else {
      showMessage('練習可能な質問がありません', 'info');
    }
  };

  // 関数：質問を選択する
  const handleSelect = (id: number) => {
    setQuestionId((prev) => (prev === id ? null : id));
  };

  // 400系エラーのみ、副作用としてメッセージを出力
  useEffect(() => {
    if (isError && !isCriticalError) {
      showMessage(getErrorMessage(error), 'error');
    }
  }, [isError, isCriticalError, error, showMessage]);

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
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
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
        <Button
          variant="outlined"
          size="large"
          sx={{
            minWidth: 230,
            borderWidth: 2,
            borderColor: 'primary.main',
            color: 'primary.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderWidth: 2,
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '& .MuiButton-startIcon': {
                animation: 'rotate 0.6s ease-in-out',
              },
            },
            '@keyframes rotate': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
          }}
          startIcon={<ShuffleIcon />}
          onClick={handleRandomSelect}
        >
          ランダムに1問練習
        </Button>
        <Button
          variant="contained"
          component={RouterLink}
          disabled={questionId === null}
          to={questionId !== null ? `/authority-check/${questionId}` : '#'}
          size="large"
          startIcon={<VideocamOutlinedIcon />}
          sx={{
            minWidth: 230,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            },
          }}
        >
          選択した質問で練習を開始
        </Button>
      </Stack>
      {/* 4. モーダル本体の配置 */}
      <CreateQuestionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
      />
    </MainLayout>
  );
};

export default QuestionSelectionPage;
