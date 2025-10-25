import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

let widths = window.innerWidth; 
let height = window.innerHeight; 
let aspect = widths/height; 
let camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000); 
camera.position.set(0, 5, 15); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

