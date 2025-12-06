import { useState, useEffect } from 'react';

// Extend the Performance interface for TypeScript
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export const useMemory = () => {
  const [memory, setMemory] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        setMemory({
          used: performance.memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          limit: performance.memory.jsHeapSizeLimit / 1024 / 1024,
        });
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return memory;
};