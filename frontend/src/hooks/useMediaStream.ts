// TODO: カメラ接続失敗時のエラー処理を実装する。（モーダルを展開）
import { MediaState } from '@/types/media';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';

export const useMediaStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // クリーンアップ関数で扱えるように、setupDevicesの外に配置
  const streamRef = useRef<MediaStream | null>(null);
  const { audioLevel, startAnalysis, stopAnalysis } = useAudioAnalyser();

  const [mediaState, setMediaState] = useState<MediaState>({
    // 初期値を定義
    stream: null,
    videoStatus: 'checking',
    audioStatus: 'checking',
    audioLevel: 0,
    error: null,
  });

  // リトライボタンで使い回すためにuseCallbackが必要
  const setupDevices = useCallback(async () => {
    // 前回のストリームがあれば先に止める（二重起動防止）
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    // errorの場合に初期化するため
    setMediaState((prev) => ({ ...prev, videoStatus: 'checking', audioStatus: 'checking' }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: 16 / 9 },
        audio: true,
      });
      startAnalysis(stream);

      streamRef.current = stream; // クリーンアップ用にuseRefで管理

      setMediaState((prev) => ({
        // 成功時はstream保持、status更新
        ...prev,
        stream: stream,
        videoStatus: 'ready',
        audioStatus: 'ready',
      }));

      if (videoRef.current) {
        // Propsで渡せないためHTML<video>に直接繋ぐ
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.log('接続エラー:', err);
      // TODO: ここでtypeをerrorにセット、switch 文を入れる
    }
  }, [startAnalysis]);

  useEffect(() => {
    setupDevices();

    // アンマウント（コンポーネントが消える時）に実行される。
    // chromeの挙動でページ離脱後、数秒カメラのランプが点灯する可能性あり。
    return () => {
      stopAnalysis();
      if (streamRef.current) {
        // 全てのトラック（映像・音声）を停止
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`${track.kind} track stopped`);
        });
        // 念の為の処理
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.load(); // 映像入力をリセット
        }
        streamRef.current = null;
      }
    };
  }, [setupDevices, stopAnalysis]);

  return { videoRef, mediaState: { ...mediaState, audioLevel }, setupDevices };
};
