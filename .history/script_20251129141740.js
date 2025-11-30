import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0,5,15); 
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor(0x555555);  
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(widths, height);

scenes.add(new THREE.GridHelper(30,30)); 
const controls = new PointerLockControls(camera, renderer.domElement);
const keyboard = []; 
const triggers = speed => {
    if(keyboard['w']) controls.moveForward(speed)
    if(keyboard['s']) controls.moveForward(-speed)
    if(keyboard['a']) controls.moveForward(-speed)
} 
window.addEventListener('keyup', function(e) {
    if(e.key == "Enter") {
        controls.lock();
    }
})
 
document.body.appendChild(renderer.domElement); 

const animate = () => {
    renderer.render(scenes, camera); 
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})