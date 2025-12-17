import { useState, useEffect } from "react";
import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";

/**
 * Interface representing Core Web Vitals metrics
 *
 * @property {number | null} lcp - Largest Contentful Paint (milliseconds)
 * @property {number | null} fcp - First Contentful Paint (milliseconds)
 * @property {number | null} cls - Cumulative Layout Shift (score)
 * @property {number | null} inp - Interaction to Next Paint (milliseconds)
 * @property {number | null} ttfb - Time to First Byte (milliseconds)
 */
export interface WebVitals {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
}

/**
 * Custom hook to monitor Google's Core Web Vitals metrics
 *
 * This hook uses the official 'web-vitals' library to track:
 * - LCP (Largest Contentful Paint): Measures loading performance
 * - FCP (First Contentful Paint): Measures perceived load speed
 * - CLS (Cumulative Layout Shift): Measures visual stability
 * - INP (Interaction to Next Paint): Measures responsiveness
 * - TTFB (Time to First Byte): Measures server response time
 *
 * @returns {WebVitals} Object containing all Core Web Vitals metrics
 */
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitals>({
    lcp: null,
    fcp: null,
    cls: null,
    inp: null,
    ttfb: null,
  });

  useEffect(() => {
    // Track Largest Contentful Paint
    // Good: < 2500ms, Needs Improvement: 2500-4000ms, Poor: > 4000ms
    onLCP((metric) => {
      setVitals((prev) => ({ ...prev, lcp: metric.value }));
    });

    // Track First Contentful Paint
    // Good: < 1800ms, Needs Improvement: 1800-3000ms, Poor: > 3000ms
    onFCP((metric) => {
      setVitals((prev) => ({ ...prev, fcp: metric.value }));
    });

    // Track Cumulative Layout Shift
    // Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
    onCLS((metric) => {
      setVitals((prev) => ({ ...prev, cls: metric.value }));
    });

    // Track Interaction to Next Paint
    // Good: < 200ms, Needs Improvement: 200-500ms, Poor: > 500ms
    onINP((metric) => {
      setVitals((prev) => ({ ...prev, inp: metric.value }));
    });

    // Track Time to First Byte
    // Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms
    onTTFB((metric) => {
      setVitals((prev) => ({ ...prev, ttfb: metric.value }));
    });
  }, []);

  return vitals;
};
