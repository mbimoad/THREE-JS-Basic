import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// =============================
// Basic Scene
// =============================
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths / height; 

const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true }); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.GridHelper(30, 30)); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update();


// =============================
// Mesh (biasa) – 1 draw call
// =============================



// =============================
// Lighting
// =============================
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scenes.add(light);


// =============================
// Loop
// =============================
const animate = () => {
    renderer.render(scenes, camera);
    requestAnimationFrame(animate);
};
animate();


// =============================
// Resize
// =============================
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
});