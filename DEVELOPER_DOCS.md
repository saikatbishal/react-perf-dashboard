# Developer Documentation: React Performance Dashboard

## Overview

The **React Performance Dashboard** is a lightweight, drop-in component for React applications that provides real-time performance metrics. It is designed to help developers monitor application health during development and testing.

The dashboard tracks:

- **FPS (Frames Per Second):** Monitors rendering performance.
- **Memory Usage:** Tracks JS Heap size (Chrome-based browsers only).
- **Web Vitals:** Monitors Core Web Vitals (LCP, FID, CLS, INP) using PerformanceObserver API.
- **Network Requests:** Intercepts and logs `fetch` requests with status and duration.

## Project Structure

```
src/
├── components/
│   └── Dashboard.tsx       # Main UI component for the dashboard
├── hooks/
│   ├── useFps.ts           # Hook for tracking FPS
│   ├── useMemory.ts        # Hook for tracking memory usage
│   ├── useNetworkMonitor.ts # Hook for intercepting network requests
│   └── useWebVitals.ts     # Hook for tracking Core Web Vitals
├── index.ts                # Public API exports
└── vite-env.d.ts           # Vite type definitions
```

---

## Core Components & Hooks

### 1. `Dashboard` Component (`src/components/Dashboard.tsx`)

The `Dashboard` is the visual component that displays the metrics. It is designed to be:

- **Draggable:** Can be moved around the screen to avoid obstructing UI elements.
- **Minimizable:** Can be collapsed into a small pill to save space. Includes a maximize button (□) to restore the full view.
- **Zero-Dependency:** Uses inline styles to avoid CSS conflicts and external dependencies.

**Key Features:**

- **Draggable Logic:** Uses `useRef` to track dragging state (`isDragging`) and offsets (`dragOffset`) without triggering excessive re-renders. `useEffect` adds global `mousemove` and `mouseup` listeners to handle the drag operation smoothly.
- **Visuals:** Uses a "hacker green" on black aesthetic with semi-transparent backgrounds (`backdrop-filter`) for a modern developer tool look.

**Usage:**

```tsx
import { PerfDashboard } from "react-perf-dashboard";

function App() {
  return (
    <div>
      <PerfDashboard />
      {/* Your app content */}
    </div>
  );
}
```

### 2. `useFps` Hook (`src/hooks/useFps.ts`)

Tracks the application's frame rate.

**How it works:**

- Uses `requestAnimationFrame` to create a loop.
- Counts the number of frames rendered in a 1-second interval (`performance.now()`).
- Updates the state with the calculated FPS every second.
- Cleans up the animation frame loop when the component unmounts.

**Return Value:**

- `fps` (number): The current frames per second.

### 3. `useMemory` Hook (`src/hooks/useMemory.ts`)

Tracks the JavaScript Heap size usage.

**How it works:**

- Uses the `performance.memory` API (non-standard, primarily Chrome).
- Sets up a `setInterval` to poll memory usage every 1 second.
- Converts bytes to Megabytes (MB) for easier reading.

**Return Value:**

- `memory` (object | null):
  - `used`: Used JS heap size in MB.
  - `limit`: Maximum JS heap size in MB.
  - Returns `null` if the API is not supported in the current browser.

### 4. `useWebVitals` Hook (`src/hooks/useWebVitals.ts`)

Tracks Core Web Vitals metrics using the PerformanceObserver API.

**How it works:**

- Uses `PerformanceObserver` to monitor different performance entry types.
- **LCP (Largest Contentful Paint):** Observes `largest-contentful-paint` entries to track when the largest content element becomes visible.
- **FID (First Input Delay):** Observes `first-input` entries to measure the time from user interaction to browser response.
- **CLS (Cumulative Layout Shift):** Observes `layout-shift` entries to track visual stability by summing layout shift values (excluding those with recent input).
- **INP (Interaction to Next Paint):** Observes `event` entries to track the worst (longest duration) interaction responsiveness.
- All observers are gracefully handled with try-catch blocks for browser compatibility.

**Return Value:**

- `vitals` (WebVitals object):
  - `lcp`: Largest Contentful Paint in milliseconds (null if not measured yet).
  - `fid`: First Input Delay in milliseconds (null if not measured yet).
  - `cls`: Cumulative Layout Shift score (null if not measured yet).
  - `inp`: Interaction to Next Paint in milliseconds (null if not measured yet).

**Performance Thresholds (as per Google):**

- **LCP:** Good (<1200ms), Needs Improvement (1200-2500ms), Poor (>2500ms)
- **FID:** Good (<100ms), Needs Improvement (100-300ms), Poor (>300ms)
- **CLS:** Good (<0.1), Needs Improvement (0.1-0.25), Poor (>0.25)
- **INP:** Good (<200ms), Needs Improvement (200-500ms), Poor (>500ms)

### 5. `useNetworkMonitor` Hook (`src/hooks/useNetworkMonitor.ts`)

Monitors outgoing `fetch` requests.

**How it works:**

- **Monkey-patching:** It temporarily overrides `window.fetch` with a wrapper function.
- **Interception:**
  1. Captures the start time (`performance.now()`).
  2. Calls the original `fetch`.
  3. Awaits the response.
  4. Calculates duration and captures status.
- **State Management:** Maintains a list of the last 5 requests to avoid cluttering the dashboard.
- **Cleanup:** Restores the original `window.fetch` when the hook unmounts to prevent side effects.

**Return Value:**

- `requests` (Array<NetworkRequest>): List of recent requests.
  - `url`: Request URL.
  - `status`: HTTP status code (e.g., 200, 404).
  - `duration`: Time taken in milliseconds.
  - `timestamp`: Time of request.

---

## Development Workflow

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.

### Running Locally

This project is set up as a library, but you can test it by importing it into a test app or running a dev server if configured.

```bash
npm run dev
```

### Building

To build the library for distribution:

```bash
npm run build
```

This uses Vite to bundle the code into a distributable format (likely ESM and CJS).

## Best Practices Used

- **Performance:** `requestAnimationFrame` is used for FPS to ensure it doesn't block the main thread.
- **Safety:** Original browser APIs (like `fetch`) are restored in cleanup functions to avoid polluting the global scope permanently.
- **Types:** Full TypeScript support with defined interfaces for better developer experience.
