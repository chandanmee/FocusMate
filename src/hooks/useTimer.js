import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialDuration = 25 * 60, onComplete = null) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Start timer
  const start = () => {
    if (!isRunning && !isPaused) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pause timer
  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  // Resume timer
  const resume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  // Stop timer
  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(initialDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Reset timer
  const reset = () => {
    stop();
    setTimeLeft(initialDuration);
  };

  // Get elapsed time
  const getElapsedTime = () => {
    if (!startTimeRef.current) return 0;
    return Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  // Track paused time
  useEffect(() => {
    let pauseStartTime;
    if (isPaused) {
      pauseStartTime = Date.now();
    }

    return () => {
      if (isPaused && pauseStartTime) {
        pausedTimeRef.current += Date.now() - pauseStartTime;
      }
    };
  }, [isPaused]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    getElapsedTime,
    formatTime: () => formatTime(timeLeft),
    progress: ((initialDuration - timeLeft) / initialDuration) * 100
  };
};