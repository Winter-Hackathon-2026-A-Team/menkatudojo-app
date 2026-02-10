// TODO: コンテンツエリアを役割ごとにコンポーネントに切り出す
import { PersonalitySelector } from '@/components/features/authority-check/PersonalitySelector';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessage } from '@/contexts/MessageContext';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useMediaStream } from '@/hooks/useMediaStream';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Box, Button, Stack, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const AuthorityCheckPage = () => {
  const navigate = useNavigate();
  const { questionId } = useParams(); // URLからquestionIdを取得
  const { videoRef, setupDevices, mediaState } = useMediaStream();
  const { audioLevel, startAnalysis, stopAnalysis } = useAudioAnalyser();
  const { showMessage } = useMessage(); // globalMessageの関数を取得
  const hasNotifiedRef = useRef(false); // メッセージ出力が多重発火しないようにフラグを作る

  // カメラ・マイクの準備が完了している状態を定義
  const isReady = mediaState.videoStatus === 'ready' && mediaState.audioStatus === 'ready';
  // 準備完了したら録画画面へ遷移
  const handleStart = () => {
    if (!isReady) return;
    navigate(`/interview/session/${questionId}`);
  };

  // アバターの選択（LocalStorageに保存）
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<number>(() => {
    const saved = localStorage.getItem('selectedPersonalityId');
    return saved ? Number(saved) : 1;
  });

  const handlePersonalitySelect = (id: number) => {
    setSelectedPersonalityId(id);
    localStorage.setItem('selectedPersonalityId', String(id));
  };

  useEffect(() => {
    const init = async () => {
      // 1. ストリームを取得
      const stream = await setupDevices();
      // 2. 取得できたら解析を開始
      if (stream) {
        startAnalysis(stream);
      }
    };
    init();

    return () => {
      stopAnalysis(); // 画面を離れる時に解析を止める
    };
  }, [setupDevices, startAnalysis, stopAnalysis]);

  // デバイス準備完了時にglobalMessageに出力
  useEffect(() => {
    if (isReady && !hasNotifiedRef.current) {
      // 成功メッセージを表示
      showMessage('デバイスの準備が完了しました。練習を開始できます。', 'success');
      hasNotifiedRef.current = true;
    }

    // デバイスが外れた（エラーになった）場合はフラグをリセットし、
    // 次回また準備ができた時に通知できるようにする
    if (!isReady) {
      hasNotifiedRef.current = false;
    }
  }, [isReady, showMessage]);

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
              <Typography variant="body1" textAlign="center">
                カメラ・マイクが正しく動作しているか確認してください。
              </Typography>
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
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: mediaState.videoStatus === 'ready' ? 'block' : 'none',
                  }}
                />

                {/* 準備中の表示 */}
                {mediaState.videoStatus !== 'ready' && (
                  <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ position: 'absolute', inset: 0, color: 'white' }}
                  >
                    <VideocamOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    <Typography variant="body2">カメラを準備中...</Typography>
                  </Stack>
                )}
              </Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 1 }}>
                {/* 音量がある時だけアイコンに色がつく */}
                <MicIcon
                  color={audioLevel > 5 ? 'primary' : 'disabled'}
                  sx={{ transition: 'color 0.2s' }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate" // 数値を直接指定できる
                    value={audioLevel}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        // 80%を超えたら警告色（赤）にするリスク管理
                        bgcolor: audioLevel > 80 ? 'error.main' : 'primary.main',
                        transition: 'transform 0.1s linear', // 動きを滑らかに
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.primary" sx={{ minWidth: 35 }}>
                  {Math.round(mediaState.audioLevel)}%
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* 右（アバターゾーン）：Gridで3人を並べる */}
          <Box sx={{ flex: { md: 1 }, width: { xs: '100%', md: 'auto' } }}>
            <Stack spacing={3}>
              <Typography variant="body1" textAlign="center">
                フィードバックをもらう師範を選択してください。
              </Typography>
              <PersonalitySelector
                selectedPersonalityId={selectedPersonalityId}
                onSelect={handlePersonalitySelect}
              />
            </Stack>
          </Box>
        </Stack>

        {/* 下段：決定ボタン */}
        <Box alignSelf="center">
          <Button variant="contained" disabled={!isReady} onClick={handleStart}>
            練習を開始する
          </Button>
        </Box>
      </Stack>
    </MainLayout>
  );
};
