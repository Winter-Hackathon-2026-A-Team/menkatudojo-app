import { PersonalitySelector } from '@/components/features/authority-check/PersonalitySelector';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthorityCheckPage = () => {
  const navigate = useNavigate();

  const [selectedPersonalityId, setSelectedPersonalityId] = useState<number>(() => {
    const saved = localStorage.getItem('selectedPersonalityId');
    return saved ? Number(saved) : 1;
  });

  const handlePersonalitySelect = (id: number) => {
    setSelectedPersonalityId(id);
    localStorage.setItem('selectedPersonalityId', String(id));
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
              <Typography variant="h6">面接の準備</Typography>
            </Box>
          </>
        }
      />
      {/* コンテンツエリア */}
      <Stack spacing={4}>
        {/* 中段：カメラとアバターを並べる */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          {/* 左（カメラゾーン）：Stackで縦に並べる */}
          <Box sx={{ flex: { md: 1 }, width: { xs: '100%', md: 'auto' } }}>
            <Stack spacing={3}>
              <Typography variant="body1" textAlign='center'>
                カメラ・マイクが正しく動作しているか確認してください。
              </Typography>
              <Box sx={{ bgcolor: 'black', aspectRatio: '16/9' }} /> {/* ビデオ */}
              <Box sx={{ height: 20, bgcolor: 'grey.300' }} /> {/* マイクゲージ */}
            </Stack>
          </Box>

          {/* 右（アバターゾーン）：Gridで3人を並べる */}
          <Box sx={{ flex: { md: 1 }, width: { xs: '100%', md: 'auto' } }}>
            <Stack spacing={3}>
              <Typography variant="body1" textAlign='center'>
                フィードバックをもらう師範を選択してください。
              </Typography>
              <PersonalitySelector selectedPersonalityId={selectedPersonalityId} onSelect={handlePersonalitySelect} />
            </Stack>
          </Box>
        </Stack>

        {/* 下段：決定ボタン */}
        <Box alignSelf="center">
          <Button variant="contained">練習を開始する</Button>
        </Box>
      </Stack>
    </MainLayout>
  );
};
