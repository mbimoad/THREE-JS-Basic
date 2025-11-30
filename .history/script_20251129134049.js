import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0, 5, 15); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

scenes.add(new THREE.GridHelper(30,30));
const boxMesh = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o}))
const control = new PointerLockControls(camera, renderer.domElement); 
const keyboard = []; 
const button = document.querySelector('button'); 
control.addEventListener('lock', e => button.innerHTML = 'Lock');
control.addEventListener('unlock', e => button.innerHTML = 'Unlock');
button.addEventListener('click', function(e) {
    control.lock();
})
function updateKeyboard(speed) {
    keyboard[]
}

const animate = (time) => {
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height)
})