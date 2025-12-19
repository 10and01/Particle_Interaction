export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
}

export type SceneType = 'GALAXY' | 'SOLAR_SYSTEM';

export interface HandData {
  isDetected: boolean;
  pinchDistance: number; // 0 to 1
  palmPosition: { x: number; y: number };
  handY: number; // For rotation control (0 to 1)
}