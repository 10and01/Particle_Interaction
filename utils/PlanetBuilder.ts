import * as THREE from 'three';

export interface PlanetConfig {
  radius: number;
  color: string;
  particleCount: number;
  hasRings?: boolean;
  ringColor?: string;
  ringInner?: number;
  ringOuter?: number;
}

/**
 * Generates particle data for a planet.
 * @param config Configuration for the planet
 * @returns Object containing float32 arrays for positions, colors, sizes
 */
export const buildPlanet = (config: PlanetConfig) => {
  const { radius, color, particleCount, hasRings, ringColor, ringInner, ringOuter } = config;
  
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  
  const baseColor = new THREE.Color(color);
  const rColor = new THREE.Color(ringColor || color);

  // Planet Body
  // If rings exist, devote 40% of particles to body, rest to rings
  const bodyCount = hasRings ? Math.floor(particleCount * 0.4) : particleCount;
  
  for (let i = 0; i < bodyCount; i++) {
    // Fibonacci Sphere distribution for even spread
    const phi = Math.acos( -1 + ( 2 * i ) / bodyCount );
    const theta = Math.sqrt( bodyCount * Math.PI ) * phi;
    
    // Add some noise to surface for texture
    const r = radius * (1.0 + (Math.random() - 0.5) * 0.05);

    const x = r * Math.cos(theta) * Math.sin(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);

    positions.push(x, y, z);
    
    // Vary color slightly
    const v = 1.0 - Math.random() * 0.2;
    colors.push(baseColor.r * v, baseColor.g * v, baseColor.b * v);
    sizes.push(Math.random() * 1.5 + 0.5);
  }

  // Rings
  if (hasRings && ringInner && ringOuter) {
    const ringCount = particleCount - bodyCount;
    for (let i = 0; i < ringCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       // Distribute randomly between inner and outer
       const dist = ringInner + Math.random() * (ringOuter - ringInner);
       
       const x = Math.cos(angle) * dist;
       const z = Math.sin(angle) * dist;
       const y = (Math.random() - 0.5) * 0.1; // Very thin vertically

       positions.push(x, y, z);
       
       // Ring color variance
       const v = 0.8 + Math.random() * 0.2;
       colors.push(rColor.r * v, rColor.g * v, rColor.b * v);
       sizes.push(Math.random() * 0.8 + 0.2);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    sizes: new Float32Array(sizes)
  };
};