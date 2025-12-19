import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildPlanet, PlanetConfig } from '../utils/PlanetBuilder';
import { planetVertexShader, planetFragmentShader } from './PlanetShader';

// Define the Solar System data
const PLANET_DATA: (PlanetConfig & { name: string, dist: number, speed: number })[] = [
  { name: 'Mercury', color: '#A57C1B', dist: 4, radius: 0.3, speed: 2.5, particleCount: 500 },
  { name: 'Venus', color: '#E3BB76', dist: 6, radius: 0.5, speed: 2.0, particleCount: 800 },
  { name: 'Earth', color: '#2233FF', dist: 8, radius: 0.55, speed: 1.5, particleCount: 1000 },
  { name: 'Mars', color: '#DA4E3C', dist: 10, radius: 0.4, speed: 1.2, particleCount: 700 },
  { name: 'Jupiter', color: '#D99F6C', dist: 14, radius: 1.4, speed: 0.6, particleCount: 2000 },
  { name: 'Saturn', color: '#F4D03F', dist: 18, radius: 1.2, speed: 0.45, particleCount: 2500, hasRings: true, ringInner: 1.5, ringOuter: 2.5, ringColor: '#CDBFA0' },
  { name: 'Uranus', color: '#73ACAC', dist: 22, radius: 0.9, speed: 0.3, particleCount: 1200 },
  { name: 'Neptune', color: '#4b70dd', dist: 26, radius: 0.9, speed: 0.25, particleCount: 1200 },
];

const SUN_DATA: PlanetConfig = {
  radius: 2.5,
  color: '#FF8C00',
  particleCount: 5000,
  hasRings: false
};

interface ParticlePlanetProps {
  config: PlanetConfig;
  scale: number;
}

// Individual Planet Component
const ParticlePlanet: React.FC<ParticlePlanetProps> = ({ config, scale }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes } = useMemo(() => buildPlanet(config), [config]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScale: { value: 1.0 },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
        // Lerp scale
        mat.uniforms.uScale.value = THREE.MathUtils.lerp(mat.uniforms.uScale.value, scale, 0.1);
        // Self rotation
        meshRef.current.rotation.y += 0.005; 
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={planetVertexShader}
        fragmentShader={planetFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface SolarSystemProps {
  scale: number;
}

export const SolarSystem: React.FC<SolarSystemProps> = ({ scale }) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetGroups = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Orbit logic
    PLANET_DATA.forEach((p, i) => {
        const grp = planetGroups.current[i];
        if (grp) {
            const angle = t * p.speed * 0.3;
            grp.position.x = Math.cos(angle) * p.dist * scale; // Expand orbit with scale? 
            // Actually, keep orbit radius relative to view or fixed? 
            // If we use 'scale' prop on the planet itself, the planet grows.
            // If we multiply dist by scale, the whole system expands.
            // Let's multiply dist by scale so the whole system zooms out/in visually by expanding coordinates.
            grp.position.z = Math.sin(angle) * p.dist * scale;
        }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Sun */}
      <ParticlePlanet config={SUN_DATA} scale={scale} />

      {/* Planets */}
      {PLANET_DATA.map((p, i) => (
        <group key={p.name} ref={(el) => { if (el) planetGroups.current[i] = el; }}>
             {/* We pass scale to planet too so the particles grow */}
             <ParticlePlanet config={p} scale={scale} />
        </group>
      ))}
    </group>
  );
};