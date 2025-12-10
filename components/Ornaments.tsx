import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateOrnaments, OrnamentGroup } from '../utils/math';
import { AppState, OrnamentData } from '../types';

interface OrnamentsProps {
  appState: AppState;
}

// Reusable Instanced Mesh Handler
const InstancedGroup = ({ 
  data, 
  geometry, 
  material,
  appState,
  isMicro = false
}: { 
  data: OrnamentData[], 
  geometry: THREE.BufferGeometry, 
  material: THREE.Material,
  appState: AppState,
  isMicro?: boolean
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);
    const currentRatio = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        
        const targetRatio = appState === AppState.TREE_SHAPE ? 1 : 0;
        currentRatio.current = THREE.MathUtils.lerp(currentRatio.current, targetRatio, delta * 1.0);
        const t = currentRatio.current;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const isTree = t > 0.9;

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // 1. Position Interpolation
            dummy.position.lerpVectors(item.scatterPosition, item.treePosition, ease);

            // 2. Micro Motions
            if (isTree) {
                if (isMicro) {
                    // Twinkle jitter
                    const flicker = Math.sin(time * 5 + i * 10) * 0.05;
                    dummy.scale.setScalar(item.scale + flicker * 0.02);
                } else {
                    // Bauble Sway
                    const sway = Math.sin(time * 1.5 + item.treePosition.x) * 0.02;
                    dummy.position.y += sway;
                    dummy.scale.setScalar(item.scale);
                }
            } else {
                // Drift in scatter
                dummy.position.x += Math.sin(time * 0.5 + i) * 0.02;
                dummy.position.y += Math.cos(time * 0.4 + i) * 0.02;
                dummy.scale.setScalar(item.scale);
            }

            // 3. Rotation
            dummy.rotation.y += item.rotationSpeed * delta * 0.5;
            if (!isTree) {
                dummy.rotation.x += delta;
                dummy.rotation.z += delta;
            } else {
                dummy.rotation.x = THREE.MathUtils.lerp(dummy.rotation.x, 0, delta * 2);
                dummy.rotation.z = THREE.MathUtils.lerp(dummy.rotation.z, 0, delta * 2);
            }

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // 4. Color / Twinkle
            if (isMicro) {
                // Aggressive twinkling for micros
                const twinkle = Math.sin(time * 3 + i * 132); // -1 to 1
                const intensity = twinkle > 0.5 ? 3.0 : 1.0; // HDR boost
                
                tempColor.set(item.color);
                // Boost brightness
                tempColor.multiplyScalar(intensity);
                meshRef.current.setColorAt(i, tempColor);
            } else {
                // Static high-gloss color for others
                meshRef.current.setColorAt(i, tempColor.set(item.color));
            }
        }
        
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, data.length]}
        >
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
};

const Ornaments: React.FC<OrnamentsProps> = ({ appState }) => {
  const { boxes, baubles, micros } = useMemo<OrnamentGroup>(() => generateOrnaments(), []);
  
  // Geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []); // Base size 1, scaled by instance

  // Materials - Optimized for Maximum Brightness & Festivity
  
  // 1. Boxes: Shiny Gold Paper
  const boxMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      metalness: 0.6,
      roughness: 0.2,
      envMapIntensity: 1.5,
      color: '#ffffff' // Vertex colors override, but base helps
  }), []);

  // 2. Baubles: Ultra High Gloss Glass/Lacquer
  const baubleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
      metalness: 0.4,
      roughness: 0.05, // Almost perfect mirror
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      color: '#ffffff'
  }), []);

  // 3. Micros: Emissive Lights
  const microMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffee',
      emissiveIntensity: 2.0, // Base intensity, boosted by instance color
      toneMapped: false // Important for Bloom
  }), []);

  return (
    <group>
        <InstancedGroup data={baubles} geometry={sphereGeo} material={baubleMaterial} appState={appState} />
        <InstancedGroup data={boxes} geometry={boxGeo} material={boxMaterial} appState={appState} />
        <InstancedGroup data={micros} geometry={sphereGeo} material={microMaterial} appState={appState} isMicro={true} />
    </group>
  );
};

export default Ornaments;
