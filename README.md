# React Performance Dashboard ⚡️

[![npm version](https://img.shields.io/npm/v/@saikat786/react-perf-dashboard.svg?style=flat-square)](https://www.npmjs.com/package/@saikat786/react-perf-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

A lightweight, zero-configuration performance monitoring tool for React applications. It provides real-time visibility into **FPS (Frames Per Second)**, **Memory Usage**, **Core Web Vitals (LCP, FID, CLS, INP)**, and **Network Latency** directly in the browser, decoupled from the main React render cycle.

![Dashboard Preview](https://github.com/saikatbishal/portfolio/blob/main/public/perfmonitor.png?raw=true)

## 🚀 Why Use This?

Most performance tools (like Chrome DevTools) are heavy and require context-switching. **React Performance Dashboard** is designed to be:

- **Drop-in Ready:** No complex setup, contexts, or providers.
- **Lightweight:** < 2KB (gzipped).
- **Agnostic:** Works with any React framework (Vite, Next.js, CRA).
- **Draggable:** Floating UI that stays out of your way.

## 📦 Installation

```bash
npm install @saikat786/react-perf-dashboard
# or
yarn add @saikat786/react-perf-dashboard
```

## 🛠 Usage

Import the component and place it at the root of your application (usually App.tsx or layout.tsx).

```typeScript

import React from 'react';
import { PerfDashboard } from '@saikat786/react-perf-dashboard';

function App() {
  return (
    <>
      <PerfDashboard />
      <YourApplication />
    </>
  );
}

export default App;
```

## 📊 Metrics Tracked

| Metric                              | Description                                         | Technical Implementation                                                                                                                                                           |
| :---------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FPS (Frames Per Second)**         | Tracks real-time rendering performance.             | Uses a decoupled `requestAnimationFrame` loop to calculate frame deltas, ensuring it measures the browser's paint rate without blocking the main thread.                           |
| **Memory Usage**                    | Monitors the JS Heap size (Used vs. Limit).         | Accesses the `window.performance.memory` API (Chrome/Edge specific) to visualize memory pressure in real-time.                                                                     |
| **Web Vitals (LCP, FID, CLS, INP)** | Tracks Core Web Vitals for user experience quality. | Uses `PerformanceObserver` API to monitor largest contentful paint, first input delay, cumulative layout shift, and interaction to next paint metrics with color-coded thresholds. |
| **Network Requests**                | Visualizes active API calls and latency.            | Monkey-patches `window.fetch` to intercept requests, capturing duration, status codes, and endpoints non-intrusively.                                                              |

## 🧠 How It Works (Architecture)

This library is architected to minimize its own impact on your application's performance.

**Event Loop Isolation**: The FPS counter runs in a decoupled requestAnimationFrame loop, ensuring it measures the browser's painting capability rather than React's render cycle.

**Web Vitals Monitoring**: Uses native PerformanceObserver API to passively collect Core Web Vitals metrics (LCP, FID, CLS, INP) without adding overhead to your application.

**Fetch Interception**: Instead of requiring a custom Axios instance, the library wraps the native window.fetch prototype. This allows it to capture network metrics from any library or component automatically.

**Memory Safety**: DOM listeners for dragging are attached globally (window) but cleaned up strictly on unmount to prevent memory leaks.

## 🤝 Contributing

- Contributions are welcome! Please feel free to submit a Pull Request.

- Fork the Project
- Create your Feature Branch (git checkout -b feature/AmazingFeature)
- Commit your Changes (git commit -m 'Add some AmazingFeature')
- Push to the Branch (git push origin feature/AmazingFeature)
- Open a Pull Request

### 📝 License

Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ by **Saikat Bishal**
