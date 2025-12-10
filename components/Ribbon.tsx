import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateRibbonData } from '../utils/math';
import { AppState } from '../types';

interface RibbonProps {
  appState: AppState;
}

const Ribbon: React.FC<RibbonProps> = ({ appState }) => {
  // Generate ~600 segments for a smooth continuous look
  const data = useMemo(() => generateRibbonData(600), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // State interpolation
  const currentRatio = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const targetRatio = appState === AppState.TREE_SHAPE ? 1 : 0;
    currentRatio.current = THREE.MathUtils.lerp(currentRatio.current, targetRatio, delta * 1.0);
    const t = currentRatio.current;
    
    // Smooth ease
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    for(let i=0; i<data.length; i++) {
        const item = data[i];
        
        // Position Morph
        dummy.position.lerpVectors(item.scatterPosition, item.treePosition, ease);
        
        // Pulse Effect
        // Make the pulse travel down the ribbon
        const pulse = Math.sin(time * 3 - i * 0.05) * 0.5 + 0.5; // 0 to 1
        // Base scale + pulse
        const scale = item.scale * (1.0 + pulse * 0.5);
        
        dummy.scale.setScalar(scale);
        dummy.rotation.set(0,0,0);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        // Color Pulse
        // We can update instance color or let the material emissive handle it. 
        // Updating 600 colors per frame is cheap.
        // Let's make it super bright gold -> white pulse
        const color = new THREE.Color(item.color);
        color.lerp(new THREE.Color('#ffffff'), pulse * 0.5);
        meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, data.length]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffaa00"
        emissive="#ffaa00"
        emissiveIntensity={2.5}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export default Ribbon;
