import { useState, useCallback } from 'react';
import AsciiConverter from '../services/AsciiConverter';
import type { AsciiVideo } from '../services/AsciiConverter';

export const ConversionStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  CONVERTING: 'converting',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

export type ConversionStatus = typeof ConversionStatus[keyof typeof ConversionStatus];

interface UseAsciiConverterResult {
  status: ConversionStatus;
  progress: number;
  error: string | null;
  previewFrame: string | null;
  asciiVideo: AsciiVideo | null;
  startConversion: (file: File, width: number, characterSet: string) => Promise<void>;
  cancelConversion: () => void;
}

export default function useAsciiConverter(): UseAsciiConverterResult {
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [asciiVideo, setAsciiVideo] = useState<AsciiVideo | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const startConversion = useCallback(async (file: File, width: number, characterSet: string) => {
    try {
      setStatus('loading');
      setProgress(0);
      setError(null);
      setPreviewFrame(null);
      setIsCancelled(false);      // Initialize converter
      const converter = new AsciiConverter(characterSet);
      
      // Load video
      await converter.loadVideo(file);
      
      setStatus('converting');
      
      // Convert to ASCII
      const result = await converter.convertToAscii(
        width,
        (progressValue, preview) => {
          setProgress(progressValue);
          if (preview) setPreviewFrame(preview);
        },
        () => isCancelled
      );
      
      if (isCancelled) {
        setStatus('idle');
        return;
      }
      
      setAsciiVideo(result);
      setStatus('completed');
    }catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('error');
    }
  }, [isCancelled]);
  
  const cancelConversion = useCallback(() => {
    setIsCancelled(true);
  }, []);

  return {
    status,
    progress,
    error,
    previewFrame,
    asciiVideo,
    startConversion,
    cancelConversion
  };
}
