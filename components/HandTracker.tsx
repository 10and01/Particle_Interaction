import React, { useEffect, useRef, useState } from 'react';
import { initializeHandDetection, detectHands } from '../services/visionService';
import { HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        await initializeHandDetection();
        setLoading(false);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480, 
            facingMode: "user"
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Explicitly play to avoid autoplay policy issues
          videoRef.current.play().then(() => {
             setCameraActive(true);
             predict();
          }).catch(e => console.error("Video play failed:", e));
        }
      } catch (err) {
        console.error("Error initializing camera or mediapipe:", err);
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predict = () => {
    if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      const results = detectHands(videoRef.current);

      if (results && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Match Reference Logic:
        // Use Thumb Tip (4) and Index Tip (8) for pinch distance
        const thumb = landmarks[4];
        const index = landmarks[8];
        
        // Reference uses 2D distance for pinch
        const distance = Math.sqrt(
          Math.pow(thumb.x - index.x, 2) + 
          Math.pow(thumb.y - index.y, 2)
        );

        // Normalize distance (Reference: (dist - 0.02) / 0.25)
        // 0.02 is approx close, 0.27 is approx open
        const normalizedPinch = Math.min(Math.max((distance - 0.02) / 0.25, 0), 1);

        // Reference uses Landmark 9 (Middle Finger MCP) for Y rotation control
        const middleMcp = landmarks[9];
        
        onHandUpdate({
          isDetected: true,
          pinchDistance: normalizedPinch,
          palmPosition: { x: landmarks[0].x, y: landmarks[0].y },
          handY: middleMcp.y
        });
      } else {
        onHandUpdate({
          isDetected: false,
          pinchDistance: 0,
          palmPosition: { x: 0.5, y: 0.5 },
          handY: 0.5
        });
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-80">
      {loading && <div className="text-white text-xs bg-black/50 p-2 rounded">Initializing Vision...</div>}
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-32 h-24 rounded-lg border border-gray-700 object-cover transform -scale-x-100"
        style={{ display: cameraActive ? 'block' : 'none' }}
      />
      {!loading && cameraActive && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};