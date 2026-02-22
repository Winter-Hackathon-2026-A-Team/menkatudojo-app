import { MediaState } from '@/types/media';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useMediaStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mediaState, setMediaState] = useState<MediaState>({
    stream: null,
    videoStatus: 'checking',
    audioStatus: 'checking',
    audioLevel: 0,
    error: null,
  });

  const setupDevices = useCallback(async () => {
    // 前回のストリームを確実に停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setMediaState((prev) => ({ ...prev, videoStatus: 'checking', audioStatus: 'checking' }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: 16 / 9 },
        audio: true,
      });

      streamRef.current = stream;

      setMediaState((prev) => ({
        ...prev,
        stream: stream,
        videoStatus: 'ready',
        audioStatus: 'ready',
      }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err: any) {
      // TODO：ここでエラーオブジェクトをセット
      return null;
    }
  }, []);

  useEffect(() => {
    // cleanup 処理のみ
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        streamRef.current = null;
      }
    };
  }, []);

  return { videoRef, mediaState, setupDevices };
};
