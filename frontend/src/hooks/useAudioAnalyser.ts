import { useCallback, useRef, useState } from 'react';

export const useAudioAnalyser = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAnalysis = useCallback((stream: MediaStream) => {
    // 1. すでに動いていれば止める（二重起動防止）
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // 2. AudioContext と Analyser の作成
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = context.createAnalyser(); // 音を周波数に細かく分解するユニット
    const source = context.createMediaStreamSource(stream); // マイクから入ってくる生の音声ストリーム

    source.connect(analyser);
    analyser.fftSize = 256; // 音の波を区切る設定
    audioContextRef.current = context;

    const dataArray = new Uint8Array(analyser.frequencyBinCount); // 分解された音の大きさを一時的に保存するための入れ物

    // 3. 解析ループ関数の定義
    const update = () => {
      analyser.getByteFrequencyData(dataArray); // 現在の音の大きさを配列に格納
      const sum = dataArray.reduce((a, b) => a + b, 0); // 配列の数値を全部足す
      const average = sum / dataArray.length; // 平均を算出（音の高低を平均）

      // 0-100にマッピング
      const level = Math.min(100, Math.floor((average / 128) * 100)); // 100を超えないように
      setAudioLevel(level);

      animationFrameRef.current = requestAnimationFrame(update); // 音量ゲージのカクつき防止
    };

    update();
  }, []);

  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  return { audioLevel, startAnalysis, stopAnalysis };
};
