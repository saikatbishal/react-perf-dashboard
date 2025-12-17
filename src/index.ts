/**
 * Main entry point for the React Performance Dashboard library.
 * Exports the main Dashboard component and individual hooks for custom implementations.
 */
export { Dashboard as PerfDashboard } from "./components/Dashboard";
export { useFps } from "./hooks/useFps";
export { useMemory } from "./hooks/useMemory";
export { useNetworkMonitor } from "./hooks/useNetworkMonitor";
export { useWebVitals } from "./hooks/useWebVitals";
