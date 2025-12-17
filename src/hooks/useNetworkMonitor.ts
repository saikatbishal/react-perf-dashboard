import { useEffect, useState } from "react";

/**
 * Interface representing a captured network request.
 */
export interface NetworkRequest {
  url: string;
  status: number;
  duration: number;
  timestamp: number;
}

/**
 * Custom hook to monitor network requests initiated via `fetch`.
 *
 * This hook monkey-patches the global `window.fetch` function to intercept requests,
 * measure their duration, and capture their status. It maintains a history of the
 * last 5 requests.
 *
 * @returns {NetworkRequest[]} An array of the last 5 network requests.
 */
export const useNetworkMonitor = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);

  useEffect(() => {
    // Store the original fetch function to restore it later
    const originalFetch = window.fetch;

    // Override window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        // Call the original fetch
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        const newReq = {
          url: args[0].toString(),
          status: response.status,
          duration: parseFloat(duration.toFixed(2)),
          timestamp: Date.now(),
        };

        // Update state with the new request, keeping only the last 5
        setRequests((prev) => [newReq, ...prev].slice(0, 5));
        return response;
      } catch (err) {
        // Handle failed requests (e.g., network errors)
        setRequests((prev) =>
          [
            {
              url: args[0].toString(),
              status: 0, // 0 indicates a network error or failure to connect
              duration: performance.now() - startTime,
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 5)
        );
        throw err; // Re-throw the error so the application can handle it
      }
    };

    return () => {
      window.fetch = originalFetch; // Cleanup: Restore original fetch on unmount
    };
  }, []);

  return requests;
};
