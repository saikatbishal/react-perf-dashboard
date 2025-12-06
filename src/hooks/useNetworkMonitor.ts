import { useEffect, useState } from 'react';

export interface NetworkRequest {
  url: string;
  status: number;
  duration: number;
  timestamp: number;
}

export const useNetworkMonitor = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        const newReq = {
          url: args[0].toString(),
          status: response.status,
          duration: parseFloat(duration.toFixed(2)),
          timestamp: Date.now(),
        };

        setRequests((prev) => [newReq, ...prev].slice(0, 5)); // Keep last 5
        return response;
      } catch (err) {
        // Handle failed requests
        setRequests((prev) => [{
            url: args[0].toString(),
            status: 0, 
            duration: performance.now() - startTime,
            timestamp: Date.now()
        }, ...prev].slice(0, 5));
        throw err;
      }
    };

    return () => {
      window.fetch = originalFetch; // Cleanup on unmount
    };
  }, []);

  return requests;
};