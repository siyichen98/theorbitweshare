import * as THREE from 'three';
import { OrnamentData, OrnamentType } from '../types';

export const TREE_HEIGHT = 12;
export const TREE_RADIUS_BASE = 4.5;
export const SCATTER_RADIUS = 15;

export const randomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const randomConeSurfacePoint = (height: number, radiusBase: number): THREE.Vector3 => {
  // Height distribution: Power curve to bias slightly towards bottom (1.5)
  // but keeping enough at top for elegance.
  const hNormalized = Math.pow(Math.random(), 1.3); 
  const h = hNormalized * height;
  const y = h - height / 2;
  
  const radiusAtH = radiusBase * (1 - h / height);
  
  // Depth: Place mostly on surface (0.85 to 1.05 of radius)
  // This ensures ornaments sit "on" the branches
  const depth = 0.85 + Math.random() * 0.2; 
  const r = radiusAtH * depth;
  
  const angle = Math.random() * Math.PI * 2;
  
  return new THREE.Vector3(
    Math.cos(angle) * r,
    y,
    Math.sin(angle) * r
  );
};

export interface OrnamentGroup {
  boxes: OrnamentData[];
  baubles: OrnamentData[];
  micros: OrnamentData[];
}

export const generateRibbonData = (count: number): OrnamentData[] => {
    const data: OrnamentData[] = [];
    const windings = 6.5; // Number of times it wraps around
    
    for(let i=0; i<count; i++) {
        const t = i / count; // 0 (bottom) to 1 (top)
        
        // Reverse t for height so it spirals from top down or bottom up?
        // Let's go Top (1) to Bottom (0) visually looks nice for winding
        // Or Bottom to Top. Let's do Bottom to Top for math simplicity.
        
        const h = t * TREE_HEIGHT;
        const y = h - TREE_HEIGHT/2;
        
        // Radius tapers
        const rBase = TREE_RADIUS_BASE * (1 - t);
        // Add some sine wave offset to radius for "draping" effect? 
        // Or keep it tight. Let's keep it tight but slightly larger than tree to float.
        const radius = rBase + 0.3; 
        
        const angle = t * Math.PI * 2 * windings;
        
        const treePos = new THREE.Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
        
        data.push({
            id: `ribbon-${i}`,
            type: 'ULTRA_LIGHT',
            scatterPosition: randomSpherePoint(SCATTER_RADIUS),
            treePosition: treePos,
            scale: 0.08, // Base scale for ribbon segments
            rotationSpeed: 0,
            color: '#ffaa00' // Warm Gold
        });
    }
    return data;
};

export const generateOrnaments = (): OrnamentGroup => {
  const boxes: OrnamentData[] = [];
  const baubles: OrnamentData[] = [];
  const micros: OrnamentData[] = [];

  // 120 Small Gift Boxes
  for (let i = 0; i < 120; i++) {
    boxes.push({
      id: `box-${i}`,
      type: 'HEAVY',
      scatterPosition: randomSpherePoint(SCATTER_RADIUS),
      treePosition: randomConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS_BASE),
      // Scale Reduced: Previously ~0.7, now ~0.18
      scale: 0.12 + Math.random() * 0.12, 
      rotationSpeed: (Math.random() - 0.5) * 2,
      color: '#C5A059', // Gold
    });
  }

  // 1200 Baubles (High Density)
  for (let i = 0; i < 1200; i++) {
    const colRand = Math.random();
    let color = '#C5A059'; // Default Gold
    
    // Luxurious Palette
    if (colRand > 0.85) color = '#ffffff'; // Platinum/Silver
    else if (colRand > 0.65) color = '#f3e5ab'; // Champagne
    else if (colRand > 0.45) color = '#C5A059'; // Rich Gold
    else if (colRand > 0.30) color = '#b8860b'; // Dark Goldenrod
    else color = '#0f3d24'; // Emerald accent (fewer of these to keep brightness up)
    
    baubles.push({
      id: `bauble-${i}`,
      type: 'LIGHT',
      scatterPosition: randomSpherePoint(SCATTER_RADIUS),
      treePosition: randomConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS_BASE),
      // Scale Reduced: Previously ~0.4, now ~0.1
      scale: 0.08 + Math.random() * 0.08,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      color: color,
    });
  }

  // 300 Micro Lights (Sparkles)
  for (let i = 0; i < 300; i++) {
      micros.push({
          id: `micro-${i}`,
          type: 'ULTRA_LIGHT',
          scatterPosition: randomSpherePoint(SCATTER_RADIUS),
          treePosition: randomConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS_BASE),
          // Tiny scale
          scale: 0.04 + Math.random() * 0.03,
          rotationSpeed: 0,
          color: '#ffffee' // Super bright warm white
      });
  }

  return { boxes, baubles, micros };
};

export const generateFoliagePositions = (count: number) => {
  const scatterPositions = new Float32Array(count * 3);
  const treePositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const scatter = randomSpherePoint(SCATTER_RADIUS);
    scatterPositions[i * 3] = scatter.x;
    scatterPositions[i * 3 + 1] = scatter.y;
    scatterPositions[i * 3 + 2] = scatter.z;

    const tree = randomConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS_BASE * 1.05);
    treePositions[i * 3] = tree.x;
    treePositions[i * 3 + 1] = tree.y;
    treePositions[i * 3 + 2] = tree.z;
  }

  return { scatterPositions, treePositions };
};
