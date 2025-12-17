import { useState, useEffect } from "react";

// Extend the Performance interface for TypeScript to include the non-standard memory property
// This property is primarily available in Chrome-based browsers.
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

/**
 * Custom hook to track memory usage.
 *
 * This hook checks the `performance.memory` API (if available) every second
 * to report the used JS heap size and the heap size limit.
 *
 * @returns {{ used: number; limit: number } | null} An object containing used memory and limit in MB, or null if not supported.
 */
export const useMemory = () => {
  const [memory, setMemory] = useState<{ used: number; limit: number } | null>(
    null
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Check if the non-standard performance.memory API is available
      if (performance.memory) {
        setMemory({
          used: performance.memory.usedJSHeapSize / 1024 / 1024, // Convert bytes to MB
          limit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // Convert bytes to MB
        });
      }
    }, 1000); // Check every second

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return memory;
};
