import { useState, useEffect } from 'react';

/**
 * Interface for Web Vitals metrics
 */
export interface WebVitals {
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  inp: number | null;  // Interaction to Next Paint
}

/**
 * Extended PerformanceEntry interfaces for specific metric types
 */
interface LCPEntry extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface EventEntry extends PerformanceEntry {
  duration: number;
}

/**
 * Custom hook to track Core Web Vitals metrics.
 * 
 * This hook uses the PerformanceObserver API to monitor key performance metrics:
 * - LCP (Largest Contentful Paint): Time when the largest content element becomes visible
 * - FID (First Input Delay): Time from user interaction to browser response
 * - CLS (Cumulative Layout Shift): Measure of visual stability
 * - INP (Interaction to Next Paint): Responsiveness to user interactions
 * 
 * @returns {WebVitals} An object containing the current Web Vitals measurements
 */
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitals>({
    lcp: null,
    fid: null,
    cls:  null,
    inp: null,
  });

  useEffect(() => {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as LCPEntry;
      const lcpValue = lastEntry.renderTime || lastEntry.loadTime || 0;
      setVitals(prev => ({ ...prev, lcp: lcpValue }));
    });
    
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      console.warn('LCP not supported');
    }

    // CLS Observer
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setVitals(prev => ({ ...prev, cls: clsValue }));
        }
      }
    });
    
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      console.warn('CLS not supported');
    }

    // FID Observer (First Input Delay - simpler than INP)
    const fidObserver = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0] as FirstInputEntry;
      if (firstInput) {
        setVitals(prev => ({ 
          ...prev, 
          fid: firstInput.processingStart - firstInput.startTime 
        }));
      }
    });
    
    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {
      console.warn('FID not supported');
    }

    // INP Observer (Interaction to Next Paint)
    // INP uses 'event' entries, but we need to track the worst interaction
    let worstInp = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as EventEntry[]) {
        // Filter for interaction events and track the longest duration
        if (entry.duration && entry.duration > worstInp) {
          worstInp = entry.duration;
          setVitals(prev => ({ ...prev, inp: worstInp }));
        }
      }
    });
    
    try {
      // For INP, we observe 'event' entries
      inpObserver.observe({ 
        type: 'event', 
        buffered: true 
      } as PerformanceObserverInit);
    } catch {
      // INP/event timing not supported - fallback to FID
      console.warn('INP not supported, using FID as fallback');
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  return vitals;
};