import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
{
    "x": -0.5236732277158508,
    "y": 1.0933192404817962,
    "z": 0.9707024083089498
}

camera.position.set(0.5,0,-10); 
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
scenes.add(new THREE.GridHelper(30,30)); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 


const modeload = new GLTFLoader(); 
modeload.load('./andy_room.gltf', item => {
    scenes.add(item.scene);
    item.scene.add(new THREE.DirectionalLight(0xFFFFFF, 1)); 
})

const animate = () => {
    renderer.render(scenes, camera)
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})