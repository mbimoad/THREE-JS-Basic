import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.lookAt(0, 0, 0); 
camera.position.set(30,30,30);

const orbit = new OrbitControls(camera, renderer.domElement); 

// RGBE 
const rgbeLoader = new RGBELoader(); 
const kantorurls = new URL('./img/kantor.hdr', import.meta.url); 
rgbeLoader.load(kantorurls.href, item => {
    item.mapping = THREE.EquirectangularReflectionMapping; 
    scenes.background = item; 
    scenes.environment = item; 
})

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setClearColor(0xDDDDDD); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})