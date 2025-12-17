import React, { useState, useEffect, useRef } from 'react';
import { useFps } from '../hooks/useFps';
import { useMemory } from '../hooks/useMemory';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';
import { useWebVitals } from '../hooks/useWebVitals';

/**
 * Styles for the Dashboard component.
 * Using inline styles for portability and zero-dependency.
 */
const styles = {
  // Main container style. 
  // We remove 'bottom' and 'right' here because we will set 'top' and 'left' dynamically via state.
  container: {
    position: 'fixed' as const,
    width: '300px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#00ff41', // Hacker green
    fontFamily: 'monospace',
    fontSize: '12px',
    borderRadius: '8px',
    padding: '12px',
    zIndex: 9999, // Ensure it stays on top
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    border: '1px solid #333',
    backdropFilter: 'blur(4px)',
    userSelect: 'none' as const, // Prevents text highlighting while dragging
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    borderBottom: '1px solid #333',
    paddingBottom: '4px',
    fontWeight: 'bold' as const,
    cursor: 'grab', // Shows the user this area is draggable
  },
  minimized: {
    position: 'fixed' as const,
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#00ff41',
    fontFamily: 'monospace',
    borderRadius: '20px',
    border: '1px solid #333',
    cursor: 'grab',
    zIndex: 9999,
    userSelect: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  barBg: {
    width: '100%',
    height: '4px',
    backgroundColor: '#333',
    marginTop: '2px',
    borderRadius: '2px',
  },
  // Dynamic style for the progress bar fill
  barFill: (percent: number) => ({
    width: `${Math.min(percent, 100)}%`,
    height: '100%',
    backgroundColor: percent > 80 ? '#ff0000' : '#00ff41', // Red if usage is high
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  }),
  reqItem: {
    marginTop: '4px',
    padding: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
  },
};

/**
 * Dashboard Component
 * 
 * Displays a draggable, floating performance dashboard that shows:
 * - FPS (Frames Per Second)
 * - Memory Usage (Used / Limit)
 * - Web Vitals (LCP, FID, CLS, INP)
 * - Recent Network Requests
 */
export const Dashboard = () => {
  const fps = useFps();
  const memory = useMemory();
  const requests = useNetworkMonitor();
  const vitals = useWebVitals();
  const [minimized, setMinimized] = useState(false);

  // 1. State for Position (defaults to top-left 20px)
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // 2. Refs for Dragging Logic (Refs don't trigger re-renders, simpler for mouse movement)
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 3. Mouse Down Handler (Starts the drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow left-click drag
    if (e.button !== 0) return;

    isDragging.current = true;

    // Calculate where inside the div the user clicked, so it doesn't "snap" to the corner
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  // 4. Global Mouse Listeners (Handles moving and letting go)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {

      if (!isDragging.current) return;

      // Update position based on mouse - initial offset
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Attach to window so you can drag fast without losing focus
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Common props for the draggable container
  const containerStyle = {
    ...(minimized ? styles.minimized : styles.container),
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  if (minimized) {
    return (
      <div
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setMinimized(false)}
      >
        <span>⚡ {fps} FPS</span>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: '#00ff41',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setMinimized(false);
          }}
          title="Maximize"
        >
          □
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* The Header is the "Handle" for dragging */}
      <div style={styles.header} onMouseDown={handleMouseDown}>
        <span>PERF MONITOR</span>
        <span
          style={{ cursor: 'pointer', padding: '0 5px' }}
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger drag on close button
            setMinimized(true);
          }}
        >
          _
        </span>
      </div>

      {/* FPS SECTION */}
      <div style={styles.row}>
        <span>FPS</span>
        <span>{fps}</span>
      </div>

      {/* MEMORY SECTION */}
      {memory && (
        <div style={{ marginBottom: '10px' }}>
          <div style={styles.row}>
            <span>MEM</span>
            <span>{memory.used.toFixed(1)} / {memory.limit.toFixed(0)} MB</span>
          </div>
          <div style={styles.barBg}>
            <div style={styles.barFill((memory.used / memory.limit) * 100)} />
          </div>
        </div>
      )}

      {/* WEB VITALS SECTION */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px', marginBottom: '10px' }}>
        <div style={{ marginBottom: '4px', color: '#888', fontWeight: 'bold' }}>WEB VITALS</div>
        <div style={styles.row}>
          <span>LCP</span>
          <span style={{ color: vitals.lcp && vitals.lcp > 2500 ? '#ff6b6b' : vitals.lcp && vitals.lcp > 1200 ? '#ffa500' : '#00ff41' }}>
            {vitals.lcp ? `${vitals.lcp.toFixed(0)}ms` : 'N/A'}
          </span>
        </div>
        <div style={styles.row}>
          <span>FID</span>
          <span style={{ color: vitals.fid && vitals.fid > 300 ? '#ff6b6b' : vitals.fid && vitals.fid > 100 ? '#ffa500' : '#00ff41' }}>
            {vitals.fid ? `${vitals.fid.toFixed(0)}ms` : 'N/A'}
          </span>
        </div>
        <div style={styles.row}>
          <span>CLS</span>
          <span style={{ color: vitals.cls && vitals.cls > 0.25 ? '#ff6b6b' : vitals.cls && vitals.cls > 0.1 ? '#ffa500' : '#00ff41' }}>
            {vitals.cls !== null ? vitals.cls.toFixed(3) : 'N/A'}
          </span>
        </div>
        <div style={styles.row}>
          <span>INP</span>
          <span style={{ color: vitals.inp && vitals.inp > 500 ? '#ff6b6b' : vitals.inp && vitals.inp > 200 ? '#ffa500' : '#00ff41' }}>
            {vitals.inp ? `${vitals.inp.toFixed(0)}ms` : 'N/A'}
          </span>
        </div>
      </div>

      {/* NETWORK SECTION */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px' }}>
        <div style={{ marginBottom: '4px', color: '#888' }}>NETWORK (Last 5)</div>
        {requests.length === 0 && <div style={{ color: '#555' }}>No active requests</div>}
        {requests.map((req, i) => (
          <div key={i} style={styles.reqItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {req.url.split('/').pop() || req.url}
              </span>
              <span style={{ color: req.status >= 400 ? 'red' : 'inherit' }}>{req.status}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#888', textAlign: 'right' }}>
              {req.duration.toFixed(0)}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};