export const planetVertexShader = `
  uniform float uTime;
  uniform float uScale;
  
  attribute float aSize;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    
    // Simple position transform
    vec3 scaledPos = position * uScale;
    
    vec4 mvPosition = modelViewMatrix * vec4(scaledPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // View Distance
    float dist = -mvPosition.z;

    // Point Size Logic (Perspective)
    gl_PointSize = (aSize * uScale * 150.0) / dist;
    gl_PointSize = clamp(gl_PointSize, 1.0, 15.0);

    // Alpha Logic - Inverse Square Law
    float distSq = dist * dist;
    float attenuation = 2500.0 / max(1.0, distSq);
    attenuation = min(1.0, attenuation);

    vAlpha = attenuation;
  }
`;

export const planetFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;

    // Nice soft glow
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * strength);
  }
`;