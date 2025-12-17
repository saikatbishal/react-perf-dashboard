import { useEffect, useState } from "react";

/**
 * Custom hook to track Frames Per Second (FPS).
 *
 * This hook uses requestAnimationFrame to count the number of frames rendered
 * within a one-second interval. It updates the state with the calculated FPS.
 *
 * @returns {number} The current FPS value.
 */
export const useFps = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    /**
     * The animation loop that runs on every frame.
     */
    const loop = () => {
      const now = performance.now();
      frameCount++;

      // Check if one second has passed
      if (now - lastTime >= 1000) {
        // Calculate FPS: (frames * 1000) / timeElapsed
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      // Schedule the next frame
      animationFrameId = requestAnimationFrame(loop);
    };

    // Start the loop
    loop();

    // Cleanup function to cancel the animation frame when the component unmounts
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return fps;
};
