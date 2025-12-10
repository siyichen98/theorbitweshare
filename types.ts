import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export type OrnamentType = 'HEAVY' | 'LIGHT' | 'ULTRA_LIGHT';

export interface OrnamentData {
  id: string;
  type: OrnamentType;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  scale: number;
  rotationSpeed: number;
  color: string;
}

export interface FoliageUniforms {
  uTime: { value: number };
  uRatio: { value: number };
  uColor: { value: THREE.Color };
}
