import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';
import { SolarSystem } from './SolarSystem';
import { CAMERA_FOV } from '../constants';
import { SceneType } from '../types';

interface ExperienceProps {
  scale: number;
  rotationX?: number; 
  palmPosition?: { x: number, y: number } | null;
  sceneType: SceneType;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}

const SceneContent: React.FC<{ 
  scale: number; 
  rotationX: number; 
  sceneType: SceneType; 
  palmPosition?: { x: number, y: number } | null 
}> = ({ scale, rotationX, sceneType, palmPosition }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Basic rotation
      groupRef.current.rotation.y = time * 0.05;
      groupRef.current.rotation.x = rotationX;

      // Hand Panning Logic
      // Maps palm position (0..1) to scene position offset
      // If palmPosition is present (Hand Mode), we shift the scene
      if (palmPosition) {
        // x: 0 (left) -> -15, 1 (right) -> 15
        const targetX = (palmPosition.x - 0.5) * 30;
        // y: 0 (top) -> 15, 1 (bottom) -> -15 (Screen Y is inverted relative to 3D Y usually, but let's check)
        // Hand coordinates: 0 is top, 1 is bottom. 
        // 3D Y: Positive is up. So 0 (top) should map to Positive Y.
        const targetY = -(palmPosition.y - 0.5) * 30;

        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      } else {
        // Reset to center smoothly when manual or no hand
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.05);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {sceneType === 'GALAXY' ? (
        <ParticleSystem scale={scale} />
      ) : (
        <SolarSystem scale={scale} />
      )}
    </group>
  );
};

export const Experience: React.FC<ExperienceProps> = ({ 
  scale, 
  rotationX = 0.4, 
  palmPosition, 
  sceneType,
  onInteractionStart,
  onInteractionEnd
}) => {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={CAMERA_FOV} />
      
      <color attach="background" args={['#020205']} />
      
      <ambientLight intensity={0.2} />
      
      {sceneType === 'GALAXY' && (
         <pointLight position={[0, 0, 0]} intensity={1} color="#ffaa00" />
      )}
      
      <Suspense fallback={null}>
        <SceneContent 
            scale={scale} 
            rotationX={rotationX} 
            sceneType={sceneType} 
            palmPosition={palmPosition} 
        />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Suspense>

      <OrbitControls 
        enablePan={true} 
        panSpeed={1.0}
        enableZoom={true} 
        minDistance={5} 
        maxDistance={50} 
        autoRotate={false} 
        onStart={onInteractionStart}
        onEnd={onInteractionEnd}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};