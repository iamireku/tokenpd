
import { useState, useRef, useCallback } from 'react';

export const useGapStop = (durationMs: number = 10000) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(100);
  const timerRef = useRef<number | null>(null);

  const startGapStop = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationProgress(100);
    
    const interval = 100;
    const steps = durationMs / interval;
    let currentStep = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      currentStep++;
      const nextProgress = 100 - (currentStep / steps) * 100;
      setCalibrationProgress(nextProgress);
      
      if (currentStep >= steps) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsCalibrating(false);
      }
    }, interval);
  }, [durationMs]);

  return {
    isCalibrating,
    calibrationProgress,
    startGapStop
  };
};
