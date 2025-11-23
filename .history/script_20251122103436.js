import * as THREE from 'three'; 
import { rendererReference } from 'three/src/nodes/TSL.js';

const widths = window.innerWidth;
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 10, 5);
camera.lookAt(0, 0, 0); 
rendererReference