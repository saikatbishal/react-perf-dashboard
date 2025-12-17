import React, { useState, useEffect, useRef } from 'react';
import { useFps } from '../hooks/useFps';
import { useMemory } from '../hooks/useMemory';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';
import { useWebVitals } from '../hooks/useWebVitals';

const styles = {
  // We remove 'bottom' and 'right' here because we will set 'top' and 'left' dynamically
  container: {
    position: 'fixed' as const,
    width: '300px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '12px',
    borderRadius: '8px',
    padding: '12px',
    zIndex: 9999,
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
  barFill: (percent: number) => ({
    width: `${Math.min(percent, 100)}%`,
    height: '100%',
    backgroundColor: percent > 80 ? '#ff0000' : '#00ff41',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  }),
  reqItem: {
    marginTop: '4px',
    padding: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
  },
  vitalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
    fontSize: '11px',
  },
};

export const Dashboard = () => {
  const fps = useFps();
  const memory = useMemory();
  const requests = useNetworkMonitor();
  const vitals = useWebVitals();
  const [minimized, setMinimized] = useState(false);

  /**
   * Helper function to determine color based on Web Vitals thresholds
   */
  const getVitalColor = (metric: keyof typeof vitals, value: number | null): string => {
    if (value === null) return '#888';
    
    switch (metric) {
      case 'lcp':
        return value < 2500 ? '#00ff41' : value < 4000 ? '#ffa500' : '#ff0000';
      case 'fcp':
        return value < 1800 ? '#00ff41' : value < 3000 ? '#ffa500' : '#ff0000';
      case 'cls':
        return value < 0.1 ? '#00ff41' : value < 0.25 ? '#ffa500' : '#ff0000';
      case 'inp':
        return value < 200 ? '#00ff41' : value < 500 ? '#ffa500' : '#ff0000';
      case 'ttfb':
        return value < 800 ? '#00ff41' : value < 1800 ? '#ffa500' : '#ff0000';
      default:
        return '#888';
    }
  };

  /**
   * Format Web Vitals value for display
   */
  const formatVital = (value: number | null, metric: keyof typeof vitals): string => {
    if (value === null) return 'N/A';
    
    // CLS is a score, not milliseconds
    if (metric === 'cls') {
      return value.toFixed(3);
    }
    
    // All other metrics are in milliseconds
    return `${Math.round(value)}ms`;
  };

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
        onClick={() => {
          // Prevent maximizing if we just finished dragging
          // A simple drag vs click check could go here, but for now simple click toggle
          // We can use a small threshold if needed, but this usually works fine.
        }}
        onDoubleClick={() => setMinimized(false)}
      >
        ⚡ {fps} FPS
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* The Header is the "Handle" for dragging */}
      <div style={styles.header} onMouseDown={handleMouseDown}>
        <span>PERF MONITOR</span>
        <span 
          style={{cursor: 'pointer', padding: '0 5px'}} 
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
        <div style={{marginBottom: '10px'}}>
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
      <div style={{borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px', marginBottom: '10px'}}>
        <div style={{marginBottom: '6px', color: '#888', fontWeight: 'bold'}}>WEB VITALS</div>
        
        {/* LCP - Largest Contentful Paint */}
        <div style={styles.vitalRow}>
          <span>LCP:</span>
          <span style={{color: getVitalColor('lcp', vitals.lcp)}}>
            {formatVital(vitals.lcp, 'lcp')}
          </span>
        </div>

        {/* FCP - First Contentful Paint */}
        <div style={styles.vitalRow}>
          <span>FCP:</span>
          <span style={{color: getVitalColor('fcp', vitals.fcp)}}>
            {formatVital(vitals.fcp, 'fcp')}
          </span>
        </div>

        {/* CLS - Cumulative Layout Shift */}
        <div style={styles.vitalRow}>
          <span>CLS:</span>
          <span style={{color: getVitalColor('cls', vitals.cls)}}>
            {formatVital(vitals.cls, 'cls')}
          </span>
        </div>

        {/* INP - Interaction to Next Paint */}
        <div style={styles.vitalRow}>
          <span>INP:</span>
          <span style={{color: getVitalColor('inp', vitals.inp)}}>
            {formatVital(vitals.inp, 'inp')}
          </span>
        </div>

        {/* TTFB - Time to First Byte */}
        <div style={styles.vitalRow}>
          <span>TTFB:</span>
          <span style={{color: getVitalColor('ttfb', vitals.ttfb)}}>
            {formatVital(vitals.ttfb, 'ttfb')}
          </span>
        </div>
      </div>

      {/* NETWORK SECTION */}
      <div style={{borderTop: '1px solid #333', paddingTop: '8px', marginTop: '8px'}}>
        <div style={{marginBottom: '4px', color: '#888'}}>NETWORK (Last 5)</div>
        {requests.length === 0 && <div style={{color:'#555'}}>No active requests</div>}
        {requests.map((req, i) => (
          <div key={i} style={styles.reqItem}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {req.url.split('/').pop() || req.url}
              </span>
              <span style={{color: req.status >= 400 ? 'red' : 'inherit'}}>{req.status}</span>
            </div>
            <div style={{fontSize: '10px', color: '#888', textAlign: 'right'}}>
              {req.duration.toFixed(0)}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};