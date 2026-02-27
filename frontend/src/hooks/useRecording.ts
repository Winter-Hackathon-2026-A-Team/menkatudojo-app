import { MediaState } from '@/types/media';
import { Question } from '@/types/question';
import { RecordingError, RecordingState } from '@/types/recording';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>({ phase: 'initializing' });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. 基本操作（リセット）
  const resetRecording = useCallback(() => {
    setState((prev) => {
      if ('videoURL' in prev && prev.videoURL) {
        URL.revokeObjectURL(prev.videoURL);
      }

      if (
        prev.phase === 'completed' ||
        prev.phase === 'error' ||
        prev.phase === 'uploading' ||
        prev.phase === 'analyzing'
      ) {
        return {
          phase: 'ready',
          question: prev.question,
          mediaState: prev.mediaState,
        };
      }
      return prev;
    });
    chunksRef.current = [];
    mediaRecorderRef.current = null;
  }, []);

  // 2. 初期化
  const setReady = useCallback((q: Question, media: MediaState) => {
    streamRef.current = media.stream;
    setState({ phase: 'ready', question: q, mediaState: media });
  }, []);

  // 3. 録画停止
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 4. 録画開始ロジック
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'))
      return;

    try {
      const MIME_TYPE = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType: MIME_TYPE });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: MIME_TYPE });
        const url = URL.createObjectURL(blob);

        setState((prev) => {
          if (prev.phase === 'recording') {
            return {
              phase: 'completed',
              videoBlob: blob,
              videoURL: url,
              elapsed: prev.elapsed,
              question: prev.question,
              mediaState: prev.mediaState,
            };
          }
          return prev;
        });
      };

      chunksRef.current = [];
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.error('Recording start failed:', e);
      setState((prev) => {
        if (!('question' in prev)) return prev;

        const recordingError: RecordingError = {
          code: 'REC_START_FAILED',
          message: '録画の開始に失敗しました。デバイスの状態を確認してください。',
          phase: prev.phase,
          severity: 'recoverable',
          details: e,
          recovery: {
            label: 'もう一度試す',
            action: async () => {
              resetRecording();
            },
          },
        };

        return {
          phase: 'error',
          error: recordingError,
          question: prev.question,
          mediaState: prev.mediaState,
        };
      });
    }
  }, [resetRecording]);

  // 5. カウントダウン開始
  const startCountdown = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'ready') return prev;
      return {
        phase: 'countdown',
        count: 5,
        question: prev.question,
        mediaState: prev.mediaState,
      };
    });
  }, []);

  // 6. 副作用: タイマー制御
  useEffect(() => {
    if (state.phase !== 'countdown' && state.phase !== 'recording') return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.phase === 'countdown') {
          if (prev.count > 1) return { ...prev, count: prev.count - 1 };
          return {
            phase: 'recording',
            elapsed: 0,
            totalSeconds: prev.question.durationLimitSeconds || 90,
            isEndingSoon: false,
            question: prev.question,
            mediaState: prev.mediaState,
          };
        }
        if (prev.phase === 'recording') {
          const nextElapsed = prev.elapsed + 1;
          return {
            ...prev,
            elapsed: nextElapsed,
            isEndingSoon: prev.totalSeconds - nextElapsed <= 5, // 残り5秒判定
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.phase]);

  // 7. 副作用: 録画の自動制御
  useEffect(() => {
    if (state.phase !== 'recording') return;

    if (!mediaRecorderRef.current) {
      startRecording();
    }

    if (state.elapsed >= state.totalSeconds) {
      stopRecording();
    }
  }, [state, startRecording, stopRecording]); // state全体を監視して時間切れをチェック

  // 8. 副作用: アンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setState((prev) => {
        if ('videoURL' in prev && prev.videoURL) {
          URL.revokeObjectURL(prev.videoURL);
        }
        return prev;
      });
    };
  }, []);

  return {
    state,
    setState,
    setReady,
    startCountdown,
    stopRecording,
    resetRecording,
    currentStream: streamRef.current,
  };
};
