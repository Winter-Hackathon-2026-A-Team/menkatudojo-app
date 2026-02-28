import { EmptyContentView } from '@/components/common/EmptyContentView';
import { LoadingView } from '@/components/common/LoadingView';
import { PageErrorHandler } from '@/components/common/PageErrorHandler';
import { CreateQuestionModal } from '@/components/features/questions/CreateQuestionModal';
import { QuestionList } from '@/components/features/questions/QuestionList';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessage } from '@/contexts/MessageContext';
import { useGroupedQuestions } from '@/hooks/useGroupedQuestions';
import { getRandomQuestionId } from '@/utils/questionUtils';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const QuestionSelectionPage = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [questionId, setQuestionId] = useState<number | null>(null);

  // 1. データ取得
  const { data: groupedQuestions, isLoading, error, refetch } = useGroupedQuestions();

  const categories = useMemo(() => {
    if (!groupedQuestions) return [];
    return Object.keys(groupedQuestions);
  }, [groupedQuestions]);

  // 3. Early Return（ガード節）：ここから下は安全に描画を制限する
  if (isLoading) return <LoadingView />;

  if (error) {
    return <PageErrorHandler error={error} onRetry={refetch} />;
  }

  // データが正常に取得できたが、中身が空の場合
  if (!groupedQuestions || Object.keys(groupedQuestions).length === 0) {
    return (
      <EmptyContentView
        title="質問が登録されていません"
        message="練習を始めるには、まず右上のボタンから質問を作成してください。"
        actionText="質問を作成する"
        onRetry={() => setIsCreateModalOpen(true)}
      />
    );
  }

  // --- 正常系 ---

  const handleRandomSelect = () => {
    const randomId = getRandomQuestionId(groupedQuestions);

    if (randomId !== null) {
      navigate(`/authority-check/${randomId}`);
    } else {
      showMessage('練習可能な質問がありません', 'info');
    }
  };

  const handleSelect = (id: number) => {
    setQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <MainLayout>
      <PageHeader
        leftSlot={
          <>
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.primary' }}
            />
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
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
          }}
        >
          選択した質問で練習を開始
        </Button>
      </Stack>

      <CreateQuestionModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
      />
    </MainLayout>
  );
};

export default QuestionSelectionPage;
