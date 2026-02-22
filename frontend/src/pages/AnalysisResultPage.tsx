import { LoadingView } from '@/components/common/LoadingView';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERSONALITIES } from '@/constants/personalities';
import { useAnalysisResult } from '@/hooks/useAnalysisResult';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export const AnalysisResultPage = () => {
  const { answerId } = useParams<{ answerId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAnalysisResult(answerId);

  if (isLoading) return <LoadingView />;
  if (isError || !data) return <Navigate to="/questions" replace />;

  // 希少価値視点：status が completed でない、または feedback が無い場合は表示させない
  if (data.analysisStatus !== 'completed' || !data.feedback) {
    return <Box p={4}>分析が完了していません。再度時間をおいて確認してください。</Box>;
  }

  const handleNextTraining = () => {
    navigate('/questions');
  };

  const { feedback, transcript, characterConfig, questionContent } = data;

  const avatar = PERSONALITIES.find((p) => p.avatarId === characterConfig?.avatarId);
  const avatarName = avatar?.name || '担当師範';

  const feedbackItems = [
    {
      title: '良い点',
      content: feedback.goodPoints,
      bg: 'success.light',
      border: 'primary.main',
      color: 'primary.main',
    },
    {
      title: '改善点',
      content: feedback.improvePoints,
      bg: '#FFF4E5',
      border: '#FFB74D',
      color: '#663C00',
    },
    {
      title: '次に意識する一言',
      content: feedback.nextTip,
      bg: '#EFEBE9',
      border: '#5D4037',
      color: '#5D4037',
    },
  ];

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
                borderRadius: 1,
                bgcolor: '#EFEBE9',
                px: 1,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">分析結果</Typography>
            </Box>
          </>
        }
        rightSlot={
          <Button
            variant="outlined"
            startIcon={<PlayArrowOutlinedIcon />}
            onClick={handleNextTraining}
          >
            次の練習をする
          </Button>
        }
      />

      {/* サマリーエリア */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />}
        >
          {/* 評価セクション */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', color: 'text.secondary', bgcolor: 'grey.100' }}
            >
              {avatarName}の評価：
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: '900', lineHeight: 1 }}>
              {feedback.grade}
            </Typography>
          </Stack>

          {/* 質問セクション */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  bgcolor: 'grey.100',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 0.5,
                }}
              >
                実施した質問：
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: '500',
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {questionContent || '質問内容が取得できませんでした'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* メインレイアウト */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        sx={{ mt: 4, alignItems: 'stretch' }}
      >
        {/* 左カラム：動画・回答内容エリア */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            {/* 動画プレイヤー */}
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'black',
                aspectRatio: '16/9',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <video
                src={feedback.videoUrl}
                controls
                controlsList="nodownload"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            {/* 回答内容（文字起こし） */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                回答内容
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: '160px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {transcript || '（文字起こしデータがありません）'}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* フィードバックエリア */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            {feedbackItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  bgcolor: item.bg,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: item.border,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100px',
                }}
              >
                <Typography variant="subtitle2" color={item.color} fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {item.content || 'データがありません'}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </MainLayout>
  );
};
