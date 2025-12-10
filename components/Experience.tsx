import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import TreeCore from './TreeCore';
import Star from './Star';
import Ribbon from './Ribbon';
import { AppState } from '../types';

interface ExperienceProps {
  appState: AppState;
}

const SceneContent: React.FC<ExperienceProps> = ({ appState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      // Gentle rotation
      const rotationSpeed = appState === AppState.TREE_SHAPE ? 0.05 : 0.02;
      groupRef.current.rotation.y = Math.sin(t * rotationSpeed) * 0.15;
    }
  });

  return (
    <>
      <color attach="background" args={['#050f0a']} />
      
      {/* Cinematic Lighting System - Updated for Small Ornaments */}
      <ambientLight intensity={0.2} color="#0f3d24" />
      
      {/* Main Spot - Warm Gold */}
      <spotLight
        position={[15, 20, 15]}
        angle={0.4}
        penumbra={1}
        intensity={3.0}
        color="#ffeebb"
        castShadow
        shadow-bias={-0.0001}
      />
      
      {/* Contrast/Rim - Cool Green */}
      <spotLight
        position={[-15, 10, -10]}
        angle={0.6}
        penumbra={1}
        intensity={2.5}
        color="#2d6e4e"
      />
      
      {/* Fill Light (Bottom Up) - Makes the core glow */}
      <pointLight position={[0, -8, 5]} intensity={1.5} color="#C5A059" distance={25} />

      {/* Near Point Lights - Critical for sparkle on tiny baubles */}
      <pointLight position={[3, 5, 3]} intensity={1.5} color="#ffffff" distance={10} />
      <pointLight position={[-3, 2, 4]} intensity={1.5} color="#ffaa00" distance={10} />

      <group ref={groupRef}>
        <TreeCore appState={appState} />
        <Star appState={appState} />
        <Ribbon appState={appState} />
        <Foliage appState={appState} />
        <Ornaments appState={appState} />
        
        {/* Ambient Sparkles */}
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sparkles 
                count={200} 
                scale={18} 
                size={2} 
                speed={0.4} 
                opacity={0.6} 
                color="#fffebb"
            />
        </Float>
      </group>

      {/* Environment for Reflections */}
      <Environment preset="city" environmentIntensity={1.0} />

      {/* Post Processing for Luxury Glow */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} // Only very bright things bloom
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.2} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

const Experience: React.FC<ExperienceProps> = ({ appState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 4, 30], fov: 35 }}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.8, // Brighter exposure
        outputColorSpace: THREE.SRGBColorSpace
      }}
      shadows
    >
      <SceneContent appState={appState} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={15}
        maxDistance={40}
        autoRotate={appState === AppState.SCATTERED}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

export default Experience;
