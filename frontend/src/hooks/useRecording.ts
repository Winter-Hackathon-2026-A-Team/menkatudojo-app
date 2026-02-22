// TODO: 役割ごとにファイルを切り分ける、エラー時の対応を実装する、録画残り数秒の時のアクション
import { MediaState } from '@/types/media';
import { Question } from '@/types/question';
import { RecordingState } from '@/types/recording';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>({ phase: 'initializing' });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // A. 初期化（Pageから呼ばれる）
  const setReady = useCallback((q: Question, media: MediaState) => {
    streamRef.current = media.stream;
    setState({ phase: 'ready', question: q, mediaState: media });
  }, []);

  // B. 録画開始ロジック
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'))
      return;

    try {
      // 1. 定数として定義
      const MIME_TYPE = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      // 2. オブジェクトのキーは 'mimeType' に固定する必要がある
      const recorder = new MediaRecorder(stream, { mimeType: MIME_TYPE });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // 3. Blob生成時も同じ型を指定
        const blob = new Blob(chunksRef.current, { type: MIME_TYPE });
        const url = URL.createObjectURL(blob);

        setState((prev) => {
          if (prev.phase === 'recording') {
            return {
              phase: 'completed',
              videoBlob: blob,
              videoURL: url,
              question: prev.question,
              mediaState: prev.mediaState,
              elapsed: prev.elapsed, // 最終的な経過時間を保持
            };
          }
          return prev;
        });
      };

      chunksRef.current = [];
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.error('録画開始の失敗:', e);
    }
  }, []);

  // C. 録画停止
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // D. カウントダウン開始
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

  // E. リセット
  const resetRecording = useCallback(() => {
    setState((prev) => {
      // 状態の中に videoURL がある場合は、どのフェーズでも解放する
      if ('videoURL' in prev && prev.videoURL) {
        URL.revokeObjectURL(prev.videoURL);
      }

      // ready状態に戻す（question, mediaStateを維持）
      if (prev.phase === 'completed' || prev.phase === 'error' || prev.phase === 'uploading') {
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

  // F. アンマウント時の自動解放
  useEffect(() => {
    return () => {
      // 1. 録画中であれば強制停止
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // 2. メモリ（videoURL）の解放
      setState((prev) => {
        if ('videoURL' in prev && prev.videoURL) {
          URL.revokeObjectURL(prev.videoURL);
        }
        return prev;
      });

      // 参照のクリア
      mediaRecorderRef.current = null;
      chunksRef.current = [];
    };
  }, []);

  // F. タイマー制御（副作用）
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
            question: prev.question,
            mediaState: prev.mediaState,
          };
        }
        if (prev.phase === 'recording') {
          return { ...prev, elapsed: prev.elapsed + 1 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.phase]);

  // G. 録画の自動制御（副作用）
  useEffect(() => {
    if (state.phase !== 'recording') return;

    // 録画開始のキック
    if (!mediaRecorderRef.current) {
      startRecording();
    }

    // 時間切れ監視（state.elapsedを直接見ず、内部の条件式で完結させる）
    if (state.elapsed >= state.totalSeconds) {
      stopRecording();
    }
  }, [state.phase, startRecording, stopRecording]);

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
