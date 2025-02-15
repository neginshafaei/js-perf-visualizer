import { useRef, useCallback } from 'react';

export const useDebounce = (callback, delay) => {
  const timer = useRef();
  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

export const useThrottle = (callback, limit) => {
  const lastRun = useRef(0);
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, limit]);
};