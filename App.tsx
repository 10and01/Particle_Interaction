import React, { useState, useEffect } from 'react';
import { Experience } from './components/Experience';
import { HandTracker } from './components/HandTracker';
import { UI } from './components/UI';
import { HandData, SceneType } from './types';
import { MAX_SCALE, MIN_SCALE } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<'HAND' | 'MANUAL'>('HAND');
  const [sceneType, setSceneType] = useState<SceneType>('GALAXY');
  
  const [scale, setScale] = useState<number>(1.0);
  const [targetScale, setTargetScale] = useState<number>(1.0);
  
  // Rotation State
  const [rotationX, setRotationX] = useState<number>(0.4);
  const [targetRotationX, setTargetRotationX] = useState<number>(0.4);

  const [handData, setHandData] = useState<HandData | null>(null);
  
  // Track if user is manually interacting (mouse/touch on canvas or slider)
  const [isInteracting, setIsInteracting] = useState(false);

  // Smooth interpolation loop for Physics
  useEffect(() => {
    let animId: number;
    const loop = () => {
      // Linear interpolation for smooth response (Lerp)
      setScale(prev => prev + (targetScale - prev) * 0.08);
      setRotationX(prev => prev + (targetRotationX - prev) * 0.08);
      
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [targetScale, targetRotationX]);

  const handleHandUpdate = (data: HandData) => {
    setHandData(data);
    
    if (mode === 'HAND' && data.isDetected) {
      const newScale = MIN_SCALE + (data.pinchDistance * (MAX_SCALE - MIN_SCALE));
      setTargetScale(newScale);

      const y = data.handY;
      const normY = Math.max(0, Math.min(1, (y - 0.1) / 0.8));
      const newRotX = -0.6 + normY * 1.6;
      setTargetRotationX(newRotX);
    } 
  };

  const handleManualScaleChange = (val: number) => {
    if (mode === 'MANUAL') {
      setTargetScale(val);
      setTargetRotationX(0.4);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleFileUpload = (file: File) => {
    console.log("File loaded:", file.name);
    alert(`File ${file.name} received. Texture mapping would apply here.`);
  };

  return (
    <div className="w-full h-full relative bg-black">
      <Experience 
        scale={scale} 
        rotationX={rotationX}
        palmPosition={mode === 'HAND' && handData?.isDetected ? handData.palmPosition : null} 
        sceneType={sceneType}
        onInteractionStart={() => setIsInteracting(true)}
        onInteractionEnd={() => setIsInteracting(false)}
      />
      
      <UI 
        onFullscreen={handleFullscreen} 
        onFileUpload={handleFileUpload}
        mode={mode}
        setMode={setMode}
        currentScale={scale} 
        onManualScaleChange={handleManualScaleChange}
        isHandDetected={!!handData?.isDetected}
        sceneType={sceneType}
        setSceneType={setSceneType}
        hideControls={!!handData?.isDetected || isInteracting}
        setInteracting={setIsInteracting}
      />
      
      <HandTracker onHandUpdate={handleHandUpdate} />
    </div>
  );
};

export default App;