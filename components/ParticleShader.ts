export const vertexShader = `
  uniform float uTime;
  uniform float uScale;
  uniform float uChaosThreshold;
  
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOrbitRadius;
  attribute float aOrbitAngleOffset;
  attribute float aRandomness;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    
    // GALACTIC PHYSICS - STABILIZED
    // Reduced speed multiplier from 0.2 to 0.05
    float speedMultiplier = aSpeed * 0.05;
    float currentAngle = aOrbitAngleOffset + (uTime * speedMultiplier) / max(1.0, pow(aOrbitRadius, 0.8));
    
    // Core bulge logic
    float diskFactor = smoothstep(1.0, 3.0, aOrbitRadius);
    
    // Add vertical thickness variation
    float verticalSpread = position.y;
    verticalSpread *= (1.0 - diskFactor * 0.5); 

    // Calculate Position
    vec3 orbitPos = vec3(
      cos(currentAngle) * aOrbitRadius,
      verticalSpread, 
      sin(currentAngle) * aOrbitRadius
    );

    // Apply User Scale Control
    vec3 scaledPos = orbitPos * uScale;

    // CHAOS MECHANIC - STABILIZED
    float chaosFactor = smoothstep(uChaosThreshold, uChaosThreshold + 2.0, uScale);
    
    if (chaosFactor > 0.0) {
      // Slowed down the time influence on chaos to prevent rapid changes
      float timeHigh = uTime * 0.5; 
      vec3 noise = vec3(
        sin(timeHigh + aRandomness * 100.0),
        cos(timeHigh + aRandomness * 120.0),
        sin(timeHigh + aRandomness * 140.0)
      );
      // Reduced drift speed
      vec3 drift = normalize(orbitPos) * (uTime * 0.1 * chaosFactor);
      scaledPos = mix(scaledPos, scaledPos + noise * 0.8 + drift, chaosFactor * 0.5);
    }

    vec4 mvPosition = modelViewMatrix * vec4(scaledPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // View Distance (Camera to Particle)
    float dist = -mvPosition.z;

    // Point Size Logic
    gl_PointSize = (aSize * uScale * 100.0) / dist;
    gl_PointSize = clamp(gl_PointSize, 0.0, 8.0);

    // Alpha Logic with Strict Inverse Square Law
    // Intensity ~ 1 / distance^2
    float distSq = dist * dist;
    
    // We apply a scalar (2500.0) because raw coordinates are large (z=20+). 
    // Without this scalar, 1/400 would be invisible.
    float attenuation = 2500.0 / max(1.0, distSq);

    // MAX CONSTANT BRIGHTNESS = 1.0
    // As requested: clamp max brightness to 1
    attenuation = min(1.0, attenuation);

    float distAlpha = 1.0 - smoothstep(0.0, 20.0, aOrbitRadius);
    float baseAlpha = 0.15 + distAlpha * 0.35; 

    vAlpha = baseAlpha * attenuation;
  }
`;

export const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;

    // Glow gradient
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.0); // Sharper falloff

    gl_FragColor = vec4(vColor, vAlpha * strength);
  }
`;