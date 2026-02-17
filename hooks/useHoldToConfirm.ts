
import { useState, useRef, useCallback } from 'react';

export const useHoldToConfirm = (onConfirm: () => void, durationMs: number = 1000) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleStart = useCallback(() => {
    const interval = 50;
    const increment = (interval / durationMs) * 100;

    timerRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          onConfirm();
          return 100;
        }
        return prev + increment;
      });
    }, interval);
  }, [onConfirm, durationMs]);

  const handleEnd = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHoldProgress(0);
  }, []);

  return {
    holdProgress,
    handleStart,
    handleEnd
  };
};
