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
let gs = 30; 

// FPS
scenes.add(new THREE.GridHelper(gs,gs)); 
const controls = new PointerLockControls(camera, renderer.domElement);
const keyboard = []; 
const triggers = speed => {
    if(keyboard['ArrowUp']) controls.moveForward(speed)
    if(keyboard['ArrowDown']) controls.moveForward(-speed)
    if(keyboard['ArrowLeft']) controls.moveRight(-speed)
    if(keyboard['ArrowRight']) controls.moveRight(speed)
} 
window.addEventListener('keyup', function(e) {
    console.log(e.key)
    if(e.key == "Enter") controls.lock();
    else keyboard[e.key] = false;
})
window.addEventListener('keydown', e => keyboard[e.key] = true)


// Pointing 
const ground        = new THREE.Mesh(new THREE.PlaneGeometry(gs, gs), new THREE.MeshBasicMaterial({color: 0x00FF00}));
scenes.add(ground)
const machines      = [];  
const mousePosition = new THREE.Vector2(); 
const raycaster     = new THREE.Raycaster(); 
let intersects      = undefined; 
const getIntersects = (e,obj) => {
    mousePosition.x =  (e.clientX/widths) * 2 - 1;
    mousePosition.x = -(e.clientY/height) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera); 
    return raycaster.intersectObjects(obj); 
}
window.addEventListener('mousemove', function(e) {
    intersects = getIntersects(e, scenes.children); 

})

 
document.body.appendChild(renderer.domElement); 

const animate = () => {
    triggers(0.2);
    renderer.render(scenes, camera); 
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})