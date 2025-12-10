import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState } from '../types';
import { TREE_HEIGHT, SCATTER_RADIUS, randomSpherePoint } from '../utils/math';

interface StarProps {
  appState: AppState;
}

const Star: React.FC<StarProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Interpolation state
  const currentRatio = useRef(0);

  // Generate Star Shape Geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.9; // Large prominent star
    const innerRadius = 0.45;
    
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2; // Rotate to point up
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center(); // Center geometry for rotation
    return geom;
  }, []);

  // Positions
  // Tree tip is at y = height/2. Add offset for star size.
  const treePos = useMemo(() => new THREE.Vector3(0, TREE_HEIGHT / 2 + 0.6, 0), []);
  const scatterPos = useMemo(() => {
      const p = randomSpherePoint(SCATTER_RADIUS);
      // Ensure it floats high up in scatter mode
      p.y = Math.abs(p.y) + 5;
      return p;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // 1. Interpolate Position
    const targetRatio = appState === AppState.TREE_SHAPE ? 1 : 0;
    // Slower, majestic transition for the star
    currentRatio.current = THREE.MathUtils.lerp(currentRatio.current, targetRatio, delta * 0.8);
    
    // Ease curve
    const t = currentRatio.current;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    meshRef.current.position.lerpVectors(scatterPos, treePos, ease);
    
    // Move light with star
    if (lightRef.current) {
        lightRef.current.position.copy(meshRef.current.position);
        // Dim light in scatter mode
        lightRef.current.intensity = THREE.MathUtils.lerp(0.5, 3.5, ease);
    }

    // 2. Rotation
    if (t > 0.9) {
       // Tree Mode: Gentle sway/rotation
       meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
       meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.05;
       meshRef.current.rotation.x = 0;
    } else {
       // Scatter Mode: Tumble
       meshRef.current.rotation.x += delta * 0.5;
       meshRef.current.rotation.y += delta * 0.8;
    }

    // 3. Pulse Material
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
        // Heartbeat pulse
        const pulse = 1.0 + Math.sin(time * 2.5) * 0.3;
        material.emissiveIntensity = pulse;
    }
  });

  return (
    <>
        <mesh ref={meshRef} geometry={starGeometry} castShadow>
            <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFA500"
                emissiveIntensity={1}
                metalness={1.0}
                roughness={0.1}
                envMapIntensity={2}
            />
        </mesh>
        <pointLight 
            ref={lightRef}
            distance={15} 
            color="#ffeebb" 
            decay={2}
        />
    </>
  );
};

export default Star;
