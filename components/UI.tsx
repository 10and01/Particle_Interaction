import React, { useRef } from 'react';
import { MIN_SCALE, MAX_SCALE } from '../constants';
import { SceneType } from '../types';

interface UIProps {
  onFullscreen: () => void;
  onFileUpload: (file: File) => void;
  mode: 'HAND' | 'MANUAL';
  setMode: (mode: 'HAND' | 'MANUAL') => void;
  currentScale: number; 
  onManualScaleChange: (val: number) => void;
  isHandDetected: boolean;
  sceneType: SceneType;
  setSceneType: (type: SceneType) => void;
  hideControls?: boolean;
  setInteracting?: (active: boolean) => void;
}

export const UI: React.FC<UIProps> = ({ 
  onFullscreen, 
  onFileUpload, 
  mode, 
  setMode, 
  currentScale, 
  onManualScaleChange,
  isHandDetected,
  sceneType,
  setSceneType,
  hideControls = false,
  setInteracting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sliderValue = Math.min(100, Math.max(0, ((currentScale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100));

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header - Always visible but dims */}
      <div className={`flex justify-between items-start pointer-events-auto transition-opacity duration-500 ${hideControls ? 'opacity-30' : 'opacity-100'}`}>
        <div>
          <h1 className="text-4xl font-light text-white tracking-widest uppercase" style={{ textShadow: '0 0 15px rgba(100,100,255,0.6)' }}>
             {sceneType === 'GALAXY' ? 'Milky Way' : 'Solar System'}
          </h1>
          <p className="text-purple-300 text-xs tracking-[0.2em] mt-1 opacity-80 uppercase">Interactive Simulation</p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={onFullscreen}
            className="px-4 py-2 border border-white/20 bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 transition rounded-sm text-sm uppercase tracking-widest"
          >
            [ Fullscreen ]
          </button>
        </div>
      </div>

      {/* Control Panel - Fades out when interacting. Contains Buttons & Status. */}
      <div className={`pointer-events-auto flex flex-col items-center w-full max-w-md mx-auto mb-2 space-y-4 transition-all duration-500 ${hideControls ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        
        {/* SCENE TYPE TOGGLE */}
        <div className="flex space-x-4 mb-2">
             <button 
                onClick={() => setSceneType('GALAXY')}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${sceneType === 'GALAXY' ? 'border-blue-500 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
             >
                Galaxy
             </button>
             <button 
                onClick={() => setSceneType('SOLAR_SYSTEM')}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border-b-2 transition-all ${sceneType === 'SOLAR_SYSTEM' ? 'border-orange-500 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
             >
                Solar System
             </button>
        </div>

        {/* INPUT MODE TOGGLE */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button
            onClick={() => setMode('HAND')}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'HAND' 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Hand Control
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'MANUAL' 
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)]' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Manual
          </button>
        </div>

        {/* Status */}
        <div className="text-center h-6">
          {mode === 'HAND' ? (
            <div className={`flex items-center space-x-2 transition-colors ${isHandDetected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-green-400' : 'bg-red-400 animate-ping'}`}></div>
              <p className="text-xs tracking-widest">{isHandDetected ? 'HAND TRACKING ACTIVE' : 'SHOW HAND TO CAMERA'}</p>
            </div>
          ) : (
            <p className="text-white/60 text-xs tracking-widest">ADJUST EXPANSION MANUALLY</p>
          )}
        </div>
      </div>

      {/* Bottom Slider Section - REMAINS VISIBLE but dims slightly if irrelevant */}
      {/* This is kept separate so it doesn't hide when controls hide */}
      <div className={`pointer-events-auto flex flex-col items-center w-full max-w-md mx-auto mb-8 space-y-4 transition-all duration-500`}>
        <div className="w-full flex items-center space-x-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
          <span className="text-white/50 text-xs w-16 text-right tracking-wider">COLLAPSE</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            disabled={mode === 'HAND'}
            onMouseDown={() => setInteracting?.(true)}
            onMouseUp={() => setInteracting?.(false)}
            onTouchStart={() => setInteracting?.(true)}
            onTouchEnd={() => setInteracting?.(false)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const newScale = MIN_SCALE + (val / 100) * (MAX_SCALE - MIN_SCALE);
              onManualScaleChange(newScale);
            }}
            className={`flex-1 h-1 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_white] [&::-webkit-slider-thumb]:transition-transform ${mode === 'HAND' ? 'opacity-50 pointer-events-none' : 'hover:[&::-webkit-slider-thumb]:scale-125'}`}
          />
          <span className="text-white/50 text-xs w-16 tracking-wider">EXPAND</span>
        </div>

        {/* Chaos Indicator */}
        {currentScale > 3.0 && (
           <div className={`text-pink-500 text-xs font-bold tracking-[0.3em] animate-pulse border-b border-pink-500/50 pb-1 transition-opacity ${hideControls ? 'opacity-0' : 'opacity-100'}`}>ENTROPY INCREASING</div>
        )}
      </div>
      
      {/* Decorative Elements - Hide on interaction */}
      <div className={`absolute bottom-6 left-6 w-32 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transition-opacity duration-500 ${hideControls ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`absolute top-6 right-6 w-px h-32 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent transition-opacity duration-500 ${hideControls ? 'opacity-0' : 'opacity-100'}`}></div>
    </div>
  );
};