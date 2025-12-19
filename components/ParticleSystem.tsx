import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './ParticleShader';
import { 
  TOTAL_PARTICLES, 
  GALAXY_CORE_COLOR, 
  GALAXY_ARM_BLUE, 
  GALAXY_ARM_PURPLE, 
  GALAXY_DUST,
  GALAXY_NEBULA_PINK,
  GALAXY_NEBULA_CYAN,
  CHAOS_THRESHOLD 
} from '../constants';

interface ParticleSystemProps {
  scale: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ scale }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScale: { value: 1.0 },
    uChaosThreshold: { value: CHAOS_THRESHOLD },
  }), []);

  const { positions, colors, sizes, speeds, orbitRadii, angleOffsets, randomness } = useMemo(() => {
    const positions = new Float32Array(TOTAL_PARTICLES * 3);
    const colors = new Float32Array(TOTAL_PARTICLES * 3);
    const sizes = new Float32Array(TOTAL_PARTICLES);
    const speeds = new Float32Array(TOTAL_PARTICLES);
    const orbitRadii = new Float32Array(TOTAL_PARTICLES);
    const angleOffsets = new Float32Array(TOTAL_PARTICLES);
    const randomness = new Float32Array(TOTAL_PARTICLES);

    const cCore = new THREE.Color(...GALAXY_CORE_COLOR);
    const cBlue = new THREE.Color(...GALAXY_ARM_BLUE);
    const cPurple = new THREE.Color(...GALAXY_ARM_PURPLE);
    const cDust = new THREE.Color(...GALAXY_DUST);
    const cPink = new THREE.Color(...GALAXY_NEBULA_PINK);
    const cCyan = new THREE.Color(...GALAXY_NEBULA_CYAN);
    
    const tempColor = new THREE.Color();

    const arms = 3; 
    const armWidth = 0.5;
    const maxRadius = 15;
    const coreRadius = 1.5;

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const i3 = i * 3;
      
      const rRand = Math.random();
      const isCore = rRand < 0.2;

      let r, theta, y;
      
      if (isCore) {
        // Core
        r = Math.random() * coreRadius;
        r = Math.pow(r, 2) / coreRadius;
        
        theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        y = r * Math.cos(phi) * 0.8; 
        r = r * Math.sin(phi); 

        tempColor.copy(cCore).lerp(cDust, Math.random() * 0.3);
        sizes[i] = Math.random() * 2.0 + 1.0;
      } else {
        // Arms
        const distNorm = Math.pow(Math.random(), 0.8); 
        r = coreRadius + distNorm * (maxRadius - coreRadius);

        const armIndex = i % arms;
        const armAngle = (Math.PI * 2 * armIndex) / arms;
        const spiralTwist = r * 0.4; 
        
        const spread = (Math.random() - 0.5) + (Math.random() - 0.5); 
        const angleSpread = spread * armWidth * (3.0 / r); 

        theta = armAngle + spiralTwist + angleSpread;

        const diskHeight = 0.5 * Math.exp(-r * 0.1); 
        y = (Math.random() - 0.5) * diskHeight;

        // Color Logic with RICH COLORS
        const randVal = Math.random();
        
        if (randVal < 0.05) {
            // Hotspot Pink
            tempColor.copy(cPink);
            sizes[i] = Math.random() * 2.5 + 0.5;
        } else if (randVal < 0.1) {
            // Hotspot Cyan
            tempColor.copy(cCyan);
            sizes[i] = Math.random() * 2.5 + 0.5;
        } else if (randVal < 0.25) {
          // Dust lanes
          tempColor.copy(cDust); 
          sizes[i] = Math.random() * 3.0 + 1.0; 
        } else {
          // Blue/Purple Gradient
          const mixFactor = (r / maxRadius) + (Math.random() * 0.4 - 0.2);
          tempColor.copy(cBlue).lerp(cPurple, THREE.MathUtils.clamp(mixFactor, 0, 1));
          sizes[i] = Math.random() * 1.5 + 0.5;
        }
      }

      positions[i3] = 0; 
      positions[i3 + 1] = y;
      positions[i3 + 2] = 0; 

      orbitRadii[i] = r;
      angleOffsets[i] = theta;

      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      speeds[i] = Math.random() * 0.5 + 0.8; 
      randomness[i] = Math.random();
    }

    return { positions, colors, sizes, speeds, orbitRadii, angleOffsets, randomness };
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uScale.value = THREE.MathUtils.lerp(
        material.uniforms.uScale.value,
        scale,
        0.08
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={speeds.length} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aOrbitRadius" count={orbitRadii.length} array={orbitRadii} itemSize={1} />
        <bufferAttribute attach="attributes-aOrbitAngleOffset" count={angleOffsets.length} array={angleOffsets} itemSize={1} />
        <bufferAttribute attach="attributes-aRandomness" count={randomness.length} array={randomness} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};