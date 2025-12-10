import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { generateFoliagePositions } from '../utils/math';
import { AppState } from '../types';

// Define the custom shader material
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uRatio: 0,
    uColor: new THREE.Color('#0f3d24'),
    uPixelRatio: 1,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uRatio;
    uniform float uPixelRatio;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying float vRandom;

    // Cubic easing for smooth transition
    float easeInOutCubic(float x) {
        return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vRandom = aRandom;
      
      float t = easeInOutCubic(uRatio);
      
      // Interpolate position
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add breathing motion
      float breathe = sin(uTime * 1.5 + pos.y * 0.5) * 0.1;
      if (uRatio > 0.8) {
         pos += normal * breathe;
         // Spiral twist effect when forming tree
         float angle = uTime * 0.2 + pos.y * 0.2;
         float c = cos(angle * 0.1);
         float s = sin(angle * 0.1);
         pos.x += c * 0.1;
         pos.z += s * 0.1;
      } else {
         // Drifting when scattered
         pos.x += sin(uTime + aRandom * 10.0) * 0.2;
         pos.y += cos(uTime * 0.8 + aRandom * 10.0) * 0.2;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (4.0 * uPixelRatio + aRandom * 2.0) * (15.0 / -mvPosition.z);
      
      // Fade edges based on view depth for soft look
      vAlpha = smoothstep(50.0, 0.0, -mvPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vRandom;

    void main() {
      // Circular soft particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      vec3 finalColor = uColor;
      
      // Add subtle gold variation
      if (vRandom > 0.9) {
        finalColor = mix(uColor, vec3(1.0, 0.8, 0.4), 0.5);
      }

      gl_FragColor = vec4(finalColor, glow * 0.8 * vAlpha);
    }
  `
);

extend({ FoliageMaterial });

interface FoliageProps {
  appState: AppState;
}

const Foliage: React.FC<FoliageProps> = ({ appState }) => {
  const count = 4000;
  const materialRef = useRef<any>(null);
  
  const { scatterPositions, treePositions } = useMemo(() => generateFoliagePositions(count), []);
  
  const randoms = useMemo(() => {
    const array = new Float32Array(count);
    for (let i = 0; i < count; i++) array[i] = Math.random();
    return array;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);
      
      // Smooth interpolation of uRatio based on state
      const targetRatio = appState === AppState.TREE_SHAPE ? 1 : 0;
      // Linear lerp for the uniform, shader handles easing curve
      materialRef.current.uRatio = THREE.MathUtils.lerp(
        materialRef.current.uRatio,
        targetRatio,
        delta * 0.8 // Speed of transition
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={scatterPositions} // Initial bounding box, shader overrides
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <foliageMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default Foliage;
