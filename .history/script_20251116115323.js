import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer(); 
camera.position.set(5, 10, 15); 
camera.lookAt(0,0,0); 
renderer.setSize(widths, height); 
renderer.setClearColor(0xFEFEFE); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

let gridsize = 20; 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
scenes.add(new THREE.GridHelper(gridsize, gridsize)); 

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate); 

window.appendChild('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})