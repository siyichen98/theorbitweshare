import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState } from '../types';
import { TREE_HEIGHT, TREE_RADIUS_BASE } from '../utils/math';

interface TreeCoreProps {
  appState: AppState;
}

const TreeCore: React.FC<TreeCoreProps> = ({ appState }) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetOpacity = appState === AppState.TREE_SHAPE ? 1 : 0;
      const speed = appState === AppState.TREE_SHAPE ? 0.8 : 2.5;
      
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        delta * speed
      );
      
      materialRef.current.visible = materialRef.current.opacity > 0.01;
    }
  });

  return (
    <mesh position={[0, 0, 0]} receiveShadow castShadow>
      {/* 
        Slightly smaller radius (0.85) to ensure ornaments (placed at radius * 0.85-1.0) 
        mostly sit ON or slightly above the surface, not buried.
      */}
      <coneGeometry args={[TREE_RADIUS_BASE * 0.85, TREE_HEIGHT, 64, 1]} />
      <meshPhysicalMaterial 
        ref={materialRef}
        color="#072a18"        
        emissive="#02120a"
        roughness={0.6}
        metalness={0.1}
        reflectivity={0.2}
        clearcoat={0.1}       
        transparent={true}
        opacity={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default TreeCore;
